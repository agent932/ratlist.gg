-- M011: Add moderation fields to incidents table
-- M012: Update incident queries to filter by status
-- M015: Create moderation history log table

-- Add status and moderation fields to incidents
alter table public.incidents
add column if not exists status text default 'active' check (status in ('active', 'hidden', 'removed')),
add column if not exists moderated_by uuid references public.user_profiles(user_id),
add column if not exists moderated_at timestamptz,
add column if not exists moderation_reason text;

-- Add index on status for filtering
create index if not exists idx_incidents_status on public.incidents(status);

-- M012: Update fn_get_player_profile to exclude removed incidents
drop function if exists public.fn_get_player_profile(text, text);
create or replace function public.fn_get_player_profile(game_slug text, identifier text)
returns table (
  player_id uuid,
  player_identifier text,
  player_display_name text,
  game_id uuid,
  game_name text,
  report_count bigint,
  last_incident_at timestamptz,
  reputation_score int,
  reputation_tier text,
  category_counts jsonb,
  recent_incidents jsonb
)
language plpgsql
stable
as $$
declare
  v_game_id uuid;
  v_player_id uuid;
  v_report_count bigint;
  v_last_incident timestamptz;
  v_score int;
  v_tier text;
  v_category_counts jsonb;
  v_recent jsonb;
begin
  -- Get game ID
  select id into v_game_id from public.games where slug = game_slug;
  if v_game_id is null then
    return;
  end if;

  -- Get player ID
  select id into v_player_id
  from public.players
  where game_id = v_game_id and lower(identifier) = lower(fn_get_player_profile.identifier);
  
  if v_player_id is null then
    return;
  end if;

  -- Calculate stats (exclude removed incidents)
  select count(*), max(created_at)
  into v_report_count, v_last_incident
  from public.incidents
  where reported_player_id = v_player_id and status != 'removed';

  -- Calculate category counts
  select jsonb_object_agg(c.label, incident_count)
  into v_category_counts
  from (
    select category_id, count(*) as incident_count
    from public.incidents
    where reported_player_id = v_player_id and status != 'removed'
    group by category_id
  ) counts
  join public.incident_categories c on c.id = counts.category_id;

  -- Calculate reputation score (simple sum of category weights)
  select coalesce(sum(
    case c.slug
      when 'betrayal' then -10
      when 'extract-camping' then -5
      when 'stream-sniping' then -7
      when 'team-violation' then -8
      when 'scamming' then -9
      when 'cheating' then -12
      when 'toxicity' then -6
      when 'clutch-save' then 8
      when 'helpful' then 5
      else 0
    end
  ), 0)::int
  into v_score
  from public.incidents i
  join public.incident_categories c on c.id = i.category_id
  where i.reported_player_id = v_player_id and i.status != 'removed';

  -- Determine tier
  v_tier := case
    when v_score >= 50 then 'S'
    when v_score >= 20 then 'A'
    when v_score >= 0 then 'B'
    when v_score >= -10 then 'C'
    when v_score >= -30 then 'D'
    else 'F'
  end;

  -- Get recent incidents
  select jsonb_agg(
    jsonb_build_object(
      'id', i.id,
      'category', c.label,
      'description', i.description,
      'occurred_at', i.occurred_at,
      'created_at', i.created_at,
      'is_anonymous', i.is_anonymous
    )
  )
  into v_recent
  from (
    select * from public.incidents
    where reported_player_id = v_player_id and status != 'removed'
    order by created_at desc
    limit 10
  ) i
  join public.incident_categories c on c.id = i.category_id;

  return query select
    v_player_id,
    p.identifier,
    p.display_name,
    v_game_id,
    g.name,
    v_report_count,
    v_last_incident,
    v_score,
    v_tier,
    coalesce(v_category_counts, '{}'::jsonb),
    coalesce(v_recent, '[]'::jsonb)
  from public.players p
  join public.games g on g.id = p.game_id
  where p.id = v_player_id;
end;
$$;

-- M012: Update fn_get_recent_incidents to exclude removed incidents
drop function if exists public.fn_get_recent_incidents(text, int);
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
  where i.status != 'removed'
  order by i.created_at desc
  limit greatest(lim, 1);
$$;

-- M015: Create moderation history log table
create table if not exists public.moderation_logs (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references public.user_profiles(user_id),
  action text not null check (action in (
    'hide_incident',
    'remove_incident',
    'restore_incident',
    'dismiss_flag',
    'remove_via_flag',
    'warn_reporter',
    'assign_role',
    'suspend_user',
    'unsuspend_user'
  )),
  target_type text not null check (target_type in ('incident', 'flag', 'user')),
  target_id uuid not null,
  reason text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Add indexes for log queries
create index if not exists idx_moderation_logs_moderator on public.moderation_logs(moderator_id, created_at desc);
create index if not exists idx_moderation_logs_target on public.moderation_logs(target_type, target_id);
create index if not exists idx_moderation_logs_created on public.moderation_logs(created_at desc);

-- Enable RLS on moderation logs
alter table public.moderation_logs enable row level security;

-- Only moderators/admins can read logs
drop policy if exists "moderation_logs_select_policy" on public.moderation_logs;
create policy "moderation_logs_select_policy" on public.moderation_logs
  for select
  using (public.fn_user_has_role('moderator'));

-- Comments
comment on table public.moderation_logs is 'Audit trail for all moderation actions';
comment on column public.incidents.status is 'Incident visibility: active (public), hidden (moderator view only), removed (excluded from reputation)';
