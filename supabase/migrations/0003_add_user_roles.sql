-- M001: Add role column to user_profiles table
-- M002: Create RPC function for role checking
-- M003: Update RLS policies for moderator/admin access

-- Create role enum type
create type user_role as enum ('user', 'moderator', 'admin');

-- Add role column to user_profiles (if table exists, otherwise create it)
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

-- Add role column with default 'user'
alter table public.user_profiles 
add column if not exists role user_role default 'user' not null;

-- Add index on role for fast filtering
create index if not exists idx_user_profiles_role on public.user_profiles(role);

-- M002: Create RPC function to check if current user has required role
-- Returns true if user has target role or higher (admin > moderator > user)
create or replace function public.fn_user_has_role(target_role text)
returns boolean
language plpgsql
security definer
stable
as $$
declare
  user_current_role text;
  role_hierarchy jsonb := '{"user": 1, "moderator": 2, "admin": 3}'::jsonb;
begin
  -- Get current user's role
  select role::text into user_current_role
  from public.user_profiles
  where user_id = auth.uid();
  
  -- If no profile found, user has no role
  if user_current_role is null then
    return false;
  end if;
  
  -- Compare role hierarchy
  return (role_hierarchy->user_current_role)::int >= (role_hierarchy->target_role)::int;
end;
$$;

-- M003: Update RLS policies for incidents table (moderator can see reporter_user_id)
drop policy if exists "incidents_select_policy" on public.incidents;
create policy "incidents_select_policy" on public.incidents
  for select
  using (
    -- Public can see incidents, but reporter_user_id will be handled at query level
    true
  );

-- Create view for public incident access (hides reporter identity)
create or replace view public.incidents_public as
select 
  id,
  game_id,
  reported_player_id,
  category_id,
  occurred_at,
  description,
  region,
  mode,
  map,
  created_at,
  -- Only show reporter_user_id to moderators/admins
  case 
    when public.fn_user_has_role('moderator') then reporter_user_id
    else null
  end as reporter_user_id,
  -- Show is_anonymous to everyone
  is_anonymous
from public.incidents;

-- Grant access to the view
grant select on public.incidents_public to anon, authenticated;

-- M003: Update RLS policies for flags table (moderator can see flagger_user_id)
drop policy if exists "flags_select_policy" on public.flags;
create policy "flags_select_policy" on public.flags
  for select
  using (
    -- Users can see their own flags, moderators can see all
    auth.uid() = flagger_user_id or public.fn_user_has_role('moderator')
  );

-- Policy for inserting flags (authenticated users only)
drop policy if exists "flags_insert_policy" on public.flags;
create policy "flags_insert_policy" on public.flags
  for insert
  with check (
    auth.uid() = flagger_user_id
  );

-- Policy for updating flags (moderators only)
drop policy if exists "flags_update_policy" on public.flags;
create policy "flags_update_policy" on public.flags
  for update
  using (
    public.fn_user_has_role('moderator')
  );

-- M003: RLS policy for user_profiles (admins can see all, users can see own)
alter table public.user_profiles enable row level security;

drop policy if exists "user_profiles_select_policy" on public.user_profiles;
create policy "user_profiles_select_policy" on public.user_profiles
  for select
  using (
    -- Users can see their own profile, admins can see all
    auth.uid() = user_id or public.fn_user_has_role('admin')
  );

-- Policy for users to update their own display_name (not role)
drop policy if exists "user_profiles_update_policy" on public.user_profiles;
create policy "user_profiles_update_policy" on public.user_profiles
  for update
  using (
    auth.uid() = user_id
  )
  with check (
    -- Users can update display_name but not role
    auth.uid() = user_id and role = (select role from public.user_profiles where user_id = auth.uid())
  );

-- Policy for creating user profiles (on signup)
drop policy if exists "user_profiles_insert_policy" on public.user_profiles;
create policy "user_profiles_insert_policy" on public.user_profiles
  for insert
  with check (
    auth.uid() = user_id
  );

-- Comment on role function
comment on function public.fn_user_has_role is 'Check if current authenticated user has the specified role or higher. Role hierarchy: admin > moderator > user';

-- Comment on role column
comment on column public.user_profiles.role is 'User role for access control. Default is user. Moderators can manage flags and incidents, admins can manage users and settings.';
