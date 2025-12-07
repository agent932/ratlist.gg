-- Drop existing functions to allow schema changes
drop function if exists public.fn_get_user_incidents(uuid, text, int, int);
drop function if exists public.fn_get_user_flags(uuid, text, int, int);

-- Fix fn_get_user_incidents - align with actual incidents table schema
create or replace function public.fn_get_user_incidents(
  target_user_id uuid,
  status_filter text default 'all',
  limit_count int default 20,
  offset_count int default 0
)
returns table (
  id uuid,
  player_id text,
  game_id uuid,
  game_name text,
  game_slug text,
  category_id smallint,
  category_name text,
  description text,
  occurred_at timestamptz,
  region text,
  mode text,
  map text,
  is_anonymous boolean,
  flagged boolean,
  created_at timestamptz
)
language plpgsql
security definer
stable
as $$
begin
  -- Only allow users to query their own incidents (or admins)
  if auth.uid() != target_user_id and not public.fn_user_has_role('admin') then
    raise exception 'Unauthorized access to user incidents';
  end if;

  return query
  select 
    i.id,
    p.identifier as player_id,
    i.game_id,
    g.name as game_name,
    g.slug as game_slug,
    i.category_id,
    ic.label as category_name,
    i.description,
    i.occurred_at,
    i.region,
    i.mode,
    i.map,
    i.is_anonymous,
    exists(select 1 from public.flags f where f.incident_id = i.id) as flagged,
    i.created_at
  from public.incidents i
  join public.players p on p.id = i.reported_player_id
  join public.games g on g.id = i.game_id
  join public.incident_categories ic on ic.id = i.category_id
  where i.reporter_user_id = target_user_id
    and (
      status_filter = 'all'
      or (status_filter = 'flagged' and exists(select 1 from public.flags f where f.incident_id = i.id and f.status = 'open'))
    )
  order by i.created_at desc
  limit limit_count
  offset offset_count;
end;
$$;

-- Fix fn_get_user_flags - align with actual flags table schema
create or replace function public.fn_get_user_flags(
  target_user_id uuid,
  resolution_filter text default 'all',
  limit_count int default 20,
  offset_count int default 0
)
returns table (
  id uuid,
  incident_id uuid,
  player_id text,
  game_name text,
  game_slug text,
  incident_category text,
  incident_description text,
  flag_reason text,
  flag_status text,
  created_at timestamptz
)
language plpgsql
security definer
stable
as $$
begin
  -- Only allow users to query their own flags (or admins)
  if auth.uid() != target_user_id and not public.fn_user_has_role('admin') then
    raise exception 'Unauthorized access to user flags';
  end if;

  return query
  select 
    f.id,
    f.incident_id,
    p.identifier as player_id,
    g.name as game_name,
    g.slug as game_slug,
    ic.label as incident_category,
    i.description as incident_description,
    f.reason as flag_reason,
    f.status as flag_status,
    f.created_at
  from public.flags f
  join public.incidents i on i.id = f.incident_id
  join public.players p on p.id = i.reported_player_id
  join public.games g on g.id = i.game_id
  join public.incident_categories ic on ic.id = i.category_id
  where f.flagger_user_id = target_user_id
    and (
      resolution_filter = 'all'
      or (resolution_filter = 'open' and f.status = 'open')
      or (resolution_filter = 'approved' and f.status = 'approved')
      or (resolution_filter = 'dismissed' and f.status = 'dismissed')
    )
  order by f.created_at desc
  limit limit_count
  offset offset_count;
end;
$$;
