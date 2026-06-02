-- Fix player_reputation_view to only count active incidents
-- Previously included removed/hidden incidents, causing score mismatch
-- with fn_get_leaderboard which already filters by status = 'active'

create or replace view public.player_reputation_view as
select
  i.game_id,
  p.id as player_id,
  count(i.*) as report_count,
  max(i.created_at) as last_incident_at,
  jsonb_object_agg(c.slug, cnt.cnt) filter (where cnt.cnt is not null) as category_counts,
  coalesce(sum(case c.slug
    when 'betrayal' then -5
    when 'extract-camping' then -3
    when 'stream-sniping' then -4
    when 'team-violation' then -3
    when 'cheating' then -10
    when 'scamming' then -8
    when 'toxicity' then -3
    when 'griefing' then -5
    when 'teaming' then -3
    when 'friendly-fire' then -2
    when 'clutch-save' then 5
    when 'helpful' then 3
    else 0 end), 0) as score
from public.players p
join public.incidents i on i.reported_player_id = p.id and i.status = 'active'
join public.incident_categories c on c.id = i.category_id
left join (
  select category_id, reported_player_id, count(*) as cnt
  from public.incidents
  where status = 'active'
  group by category_id, reported_player_id
) cnt on cnt.reported_player_id = p.id and cnt.category_id = c.id
group by i.game_id, p.id;
