-- M022: Create dashboard stats RPC

create or replace function public.fn_get_admin_stats()
returns jsonb
language plpgsql
stable
security definer
as $$
declare
  stats jsonb;
  open_flags_count int;
  incidents_today_count int;
  users_today_count int;
  total_incidents_count bigint;
  total_users_count bigint;
  incidents_by_game jsonb;
begin
  -- Check if user is admin
  if not public.fn_user_has_role('admin') then
    raise exception 'Admin access required';
  end if;

  -- Count open flags
  select count(*)::int into open_flags_count
  from public.flags
  where status = 'open';

  -- Count incidents created today
  select count(*)::int into incidents_today_count
  from public.incidents
  where created_at >= current_date;

  -- Count users created today
  select count(*)::int into users_today_count
  from public.user_profiles
  where created_at >= current_date;

  -- Total incidents
  select count(*) into total_incidents_count
  from public.incidents;

  -- Total users
  select count(*) into total_users_count
  from public.user_profiles;

  -- Incidents by game (last 7 days)
  select jsonb_object_agg(game_name, incident_count)
  into incidents_by_game
  from (
    select g.name as game_name, count(*)::int as incident_count
    from public.incidents i
    join public.games g on g.id = i.game_id
    where i.created_at >= current_date - interval '7 days'
    group by g.name
    order by incident_count desc
  ) game_counts;

  -- Build stats object
  stats := jsonb_build_object(
    'open_flags', open_flags_count,
    'incidents_today', incidents_today_count,
    'users_today', users_today_count,
    'total_incidents', total_incidents_count,
    'total_users', total_users_count,
    'incidents_by_game_7d', coalesce(incidents_by_game, '{}'::jsonb),
    'generated_at', now()
  );

  return stats;
end;
$$;

comment on function public.fn_get_admin_stats is 'Get admin dashboard statistics. Admin only.';
