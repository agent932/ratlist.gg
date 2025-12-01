-- Update fn_get_recent_incidents to include game name and category label
create or replace function public.fn_get_recent_incidents(game_slug text, lim int)
returns table (
  id uuid,
  reported_player_id uuid,
  player_identifier text,
  player_display_name text,
  category_id smallint,
  category_label text,
  game_name text,
  description text,
  created_at timestamptz
) language sql stable as $$
  select 
    i.id, 
    i.reported_player_id, 
    p.identifier, 
    p.display_name, 
    i.category_id, 
    c.label as category_label,
    g.name as game_name,
    i.description, 
    i.created_at
  from public.incidents i
  join public.games g on g.id = i.game_id and g.slug = game_slug
  join public.players p on p.id = i.reported_player_id
  join public.incident_categories c on c.id = i.category_id
  order by i.created_at desc
  limit greatest(lim, 1);
$$;
