-- Update fn_get_user_dashboard_stats to remove tier column reference
create or replace function public.fn_get_user_dashboard_stats(
  target_user_id uuid
)
returns jsonb
language plpgsql
security definer
stable
as $$
declare
  stats jsonb;
  linked_count int;
  incidents_count int;
  flags_count int;
  reports_against_count int;
begin
  -- Only allow users to query their own stats (or admins)
  if auth.uid() != target_user_id and not public.fn_user_has_role('admin') then
    raise exception 'Unauthorized access to user stats';
  end if;

  -- Count linked players
  select count(*)
  into linked_count
  from public.player_links
  where user_id = target_user_id;

  -- Count incidents submitted by user
  select count(*)
  into incidents_count
  from public.incidents
  where reporter_user_id = target_user_id;

  -- Count flags submitted by user
  select count(*)
  into flags_count
  from public.flags
  where flagger_user_id = target_user_id;

  -- Count incidents against user's linked players
  select count(distinct i.id)
  into reports_against_count
  from public.incidents i
  join public.players p on p.id = i.reported_player_id
  join public.player_links pl on pl.player_id = p.identifier and pl.game_id = i.game_id
  where pl.user_id = target_user_id
    and i.status = 'active';  -- Only count active incidents

  -- Build JSON response
  stats := jsonb_build_object(
    'linked_players_count', linked_count,
    'incidents_submitted_count', incidents_count,
    'flags_submitted_count', flags_count,
    'reports_against_me_count', reports_against_count
  );

  return stats;
end;
$$;
