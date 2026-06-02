-- Rewrite fn_get_player_profile to calculate score directly (same as fn_get_leaderboard)
-- instead of relying on player_reputation_view which has INNER JOINs that can exclude players.
-- Also adds status = 'active' filter to match the leaderboard.

create or replace function public.fn_get_player_profile(game_slug text, identifier text)
returns table (
  game_id uuid,
  player_id uuid,
  report_count bigint,
  active_incidents bigint,
  total_incidents bigint,
  last_incident_at timestamptz,
  category_counts jsonb,
  score integer
) language sql stable as $$
  select
    g.id as game_id,
    p.id as player_id,
    count(*) filter (where i.status = 'active') as report_count,
    count(*) filter (where i.status = 'active') as active_incidents,
    count(*) as total_incidents,
    max(i.created_at) filter (where i.status = 'active') as last_incident_at,
    coalesce(
      jsonb_object_agg(c.slug, 1) filter (where i.status = 'active' and c.slug is not null),
      '{}'::jsonb
    ) as category_counts,
    coalesce(sum(case
      when i.status != 'active' then 0
      when c.slug = 'betrayal' then -5
      when c.slug = 'extract-camping' then -3
      when c.slug = 'stream-sniping' then -4
      when c.slug = 'team-violation' then -3
      when c.slug = 'cheating' then -10
      when c.slug = 'scamming' then -8
      when c.slug = 'toxicity' then -3
      when c.slug = 'griefing' then -5
      when c.slug = 'teaming' then -3
      when c.slug = 'friendly-fire' then -2
      when c.slug = 'clutch-save' then 5
      when c.slug = 'helpful' then 3
      else 0 end)::integer, 0) as score
  from public.players p
  join public.games g on g.id = p.game_id and g.slug = game_slug
  left join public.incidents i on i.reported_player_id = p.id
  left join public.incident_categories c on c.id = i.category_id
  where p.identifier = identifier
  group by g.id, p.id;
$$;
