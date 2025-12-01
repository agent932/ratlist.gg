-- Auto-create user_profiles when a new user signs up

-- Function to create user profile automatically
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.user_profiles (user_id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'user'
  );
  return new;
end;
$$;

-- Trigger to run after user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill existing users who don't have profiles
insert into public.user_profiles (user_id, display_name, role)
select 
  u.id,
  coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1)),
  'user'
from auth.users u
where not exists (
  select 1 from public.user_profiles p where p.user_id = u.id
);

comment on function public.handle_new_user is 'Automatically creates a user profile when a new user signs up';
