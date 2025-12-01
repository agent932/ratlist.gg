-- User Dashboard Functions
-- Feature: 004-user-dashboard
-- T001: Database functions for dashboard data retrieval

-- Create indexes for dashboard queries (if not exist)
create index if not exists idx_incidents_reporter_user_id on public.incidents(reporter_user_id);
create index if not exists idx_flags_flagger_user_id on public.flags(flagger_user_id);

-- Function: Get incidents submitted by user with filtering
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
  category_id uuid,
  category_name text,
  severity text,
  description text,
  evidence_url text,
  status text,
  flagged boolean,
  created_at timestamptz,
  moderated_at timestamptz,
  moderation_reason text,
  moderated_by uuid,
  moderator_name text
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
    i.severity,
    i.description,
    i.evidence_url,
    i.status,
    exists(select 1 from public.flags f where f.incident_id = i.id) as flagged,
    i.created_at,
    i.moderated_at,
    i.moderation_reason,
    i.moderated_by,
    up.display_name as moderator_name
  from public.incidents i
  join public.players p on p.id = i.reported_player_id
  join public.games g on g.id = i.game_id
  join public.incident_categories ic on ic.id = i.category_id
  left join public.user_profiles up on up.user_id = i.moderated_by
  where i.reporter_user_id = target_user_id
    and (
      status_filter = 'all'
      or (status_filter = 'active' and i.status = 'active')
      or (status_filter = 'removed' and i.status = 'removed')
      or (status_filter = 'flagged' and exists(select 1 from public.flags f where f.incident_id = i.id and f.resolution = 'open'))
    )
  order by i.created_at desc
  limit limit_count
  offset offset_count;
end;
$$;

-- Function: Get flags submitted by user with filtering
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
  resolution text,
  created_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid,
  reviewer_name text,
  moderator_notes text
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
    f.resolution,
    f.created_at,
    f.reviewed_at,
    f.reviewed_by,
    up.display_name as reviewer_name,
    f.moderator_notes
  from public.flags f
  join public.incidents i on i.id = f.incident_id
  join public.players p on p.id = i.reported_player_id
  join public.games g on g.id = i.game_id
  join public.incident_categories ic on ic.id = i.category_id
  left join public.user_profiles up on up.user_id = f.reviewed_by
  where f.flagger_user_id = target_user_id
    and (
      resolution_filter = 'all'
      or (resolution_filter = 'open' and f.resolution = 'open')
      or (resolution_filter = 'approved' and f.resolution = 'approved')
      or (resolution_filter = 'dismissed' and f.resolution = 'dismissed')
    )
  order by f.created_at desc
  limit limit_count
  offset offset_count;
end;
$$;

-- Function: Get dashboard stats for user
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

-- Comments
comment on function public.fn_get_user_incidents is 'Get incidents submitted by user with status filtering (all/active/removed/flagged)';
comment on function public.fn_get_user_flags is 'Get flags submitted by user with resolution filtering (all/open/approved/dismissed)';
comment on function public.fn_get_user_dashboard_stats is 'Get dashboard statistics for user (linked players, incidents, flags, reports against)';
