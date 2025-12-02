-- Fix fn_get_linked_players to only count active incidents
-- This ensures the incident_count matches what's displayed in the UI

create or replace function public.fn_get_linked_players(target_user_id uuid)
returns table (
  player_id text,
  game_id uuid,
  game_name text,
  game_slug text,
  linked_at timestamptz,
  incident_count bigint,
  verified boolean
)
language sql
stable
security definer
as $$
  select 
    pl.player_id,
    pl.game_id,
    g.name as game_name,
    g.slug as game_slug,
    pl.linked_at,
    coalesce(incident_counts.count, 0) as incident_count,
    pl.verified
  from public.player_links pl
  join public.games g on g.id = pl.game_id
  left join lateral (
    select count(*) as count
    from public.incidents i
    join public.players p on p.id = i.reported_player_id
    where p.identifier = pl.player_id
    and i.game_id = pl.game_id
    and i.status = 'active'  -- Only count active incidents
  ) incident_counts on true
  where pl.user_id = target_user_id
  order by pl.linked_at desc;
$$;

comment on function public.fn_get_linked_players is 'Get all player IDs linked to a user account with active incident counts';
