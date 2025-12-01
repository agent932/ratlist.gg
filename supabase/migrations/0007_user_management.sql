-- M017: Create RPC for user search
-- M020: Add user suspension system (optional)

-- M020: Add suspension fields to user_profiles FIRST (before creating functions that use them)
alter table public.user_profiles
add column if not exists suspended_until timestamptz,
add column if not exists suspension_reason text;

-- Add index for checking active suspensions
create index if not exists idx_user_profiles_suspended on public.user_profiles(suspended_until)
  where suspended_until is not null;

-- M017: User search function (admin only) - NOW we can reference suspended_until
create or replace function public.fn_search_users(
  query text default '',
  role_filter text default 'all',
  lim int default 20
)
returns table (
  user_id uuid,
  email text,
  display_name text,
  role text,
  created_at timestamptz,
  incident_count bigint,
  flag_count bigint,
  suspended_until timestamptz,
  suspension_reason text
)
language sql
stable
security definer
as $$
  select 
    up.user_id,
    u.email,
    up.display_name,
    up.role::text,
    up.created_at,
    coalesce(incident_counts.count, 0) as incident_count,
    coalesce(flag_counts.count, 0) as flag_count,
    up.suspended_until,
    up.suspension_reason
  from public.user_profiles up
  join auth.users u on u.id = up.user_id
  left join lateral (
    select count(*) as count
    from public.incidents
    where reporter_user_id = up.user_id
  ) incident_counts on true
  left join lateral (
    select count(*) as count
    from public.flags
    where flagger_user_id = up.user_id
  ) flag_counts on true
  where 
    public.fn_user_has_role('admin')
    and (query = '' or u.email ilike '%' || query || '%' or up.display_name ilike '%' || query || '%')
    and (role_filter = 'all' or up.role::text = role_filter)
  order by up.created_at desc
  limit greatest(lim, 1);
$$;

-- M020: Update RLS policy to prevent suspended users from inserting incidents
drop policy if exists "incidents_insert_policy" on public.incidents;
create policy "incidents_insert_policy" on public.incidents
  for insert
  with check (
    auth.uid() = reporter_user_id
    and not exists (
      select 1 from public.user_profiles
      where user_id = auth.uid()
      and suspended_until is not null
      and suspended_until > now()
    )
  );

-- M020: Update RLS policy to prevent suspended users from inserting flags
drop policy if exists "flags_insert_policy" on public.flags;
create policy "flags_insert_policy" on public.flags
  for insert
  with check (
    auth.uid() = flagger_user_id
    and not exists (
      select 1 from public.user_profiles
      where user_id = auth.uid()
      and suspended_until is not null
      and suspended_until > now()
    )
  );

-- Helper function to check if user is suspended
create or replace function public.fn_is_user_suspended(check_user_id uuid default null)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.user_profiles
    where user_id = coalesce(check_user_id, auth.uid())
    and suspended_until is not null
    and suspended_until > now()
  );
$$;

-- Comments
comment on function public.fn_search_users is 'Search users by email or display name with stats. Admin only.';
comment on function public.fn_is_user_suspended is 'Check if a user is currently suspended.';
comment on column public.user_profiles.suspended_until is 'Suspension expiry timestamp. NULL means not suspended.';
