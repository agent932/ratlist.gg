-- Fix fn_get_leaderboard to only count active incidents
-- Players with removed/hidden incidents were appearing with 0 reports but non-zero scores

create or replace function public.fn_get_leaderboard(game_slug text, period text)
returns table (
  player_id uuid,
  identifier text,
  display_name text,
  report_count bigint,
  score integer
) language sql stable as $$
  with base as (
    select p.id as player_id, p.identifier, p.display_name,
      sum(case c.slug
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
        else 0 end)::integer as score,
      count(*) as report_count
    from public.players p
    join public.incidents i on i.reported_player_id = p.id
    join public.incident_categories c on c.id = i.category_id
    join public.games g on g.id = i.game_id
    where g.slug = game_slug
      and i.status = 'active'
      and (
        (period = 'week' and i.created_at >= now() - interval '7 days') or
        (period = 'month' and i.created_at >= now() - interval '30 days') or
        (period not in ('week','month'))
      )
    group by p.id, p.identifier, p.display_name
    having count(*) > 0
  )
  select player_id, identifier, display_name, report_count, score
  from base order by score asc, report_count desc limit 100;
$$;
