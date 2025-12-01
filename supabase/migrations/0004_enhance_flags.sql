-- M006: Update flags table schema with moderator fields
-- M007: Create RPC for flag queue

-- Add moderator review fields to flags table
alter table public.flags
add column if not exists reviewed_by uuid references public.user_profiles(user_id),
add column if not exists reviewed_at timestamptz,
add column if not exists resolution text check (resolution in ('dismissed', 'removed_incident', 'warned_reporter'));

-- Add index for flag queue sorting
create index if not exists idx_flags_status_created on public.flags(status, created_at);

-- M007: Create RPC to get flag queue with full context
create or replace function public.fn_get_flag_queue(status_filter text default 'open', lim int default 20)
returns table (
  flag_id uuid,
  flag_reason text,
  flag_status text,
  flag_created_at timestamptz,
  flag_reviewed_by uuid,
  flag_reviewed_at timestamptz,
  flag_resolution text,
  incident_id uuid,
  incident_description text,
  incident_category_label text,
  incident_created_at timestamptz,
  reported_player_id uuid,
  reported_player_identifier text,
  reported_player_display_name text,
  reporter_user_id uuid,
  reporter_email text,
  reporter_display_name text,
  flagger_user_id uuid,
  flagger_email text,
  flagger_display_name text,
  game_name text
)
language sql
stable
security definer
as $$
  select 
    f.id as flag_id,
    f.reason as flag_reason,
    f.status as flag_status,
    f.created_at as flag_created_at,
    f.reviewed_by as flag_reviewed_by,
    f.reviewed_at as flag_reviewed_at,
    f.resolution as flag_resolution,
    i.id as incident_id,
    i.description as incident_description,
    c.label as incident_category_label,
    i.created_at as incident_created_at,
    p.id as reported_player_id,
    p.identifier as reported_player_identifier,
    p.display_name as reported_player_display_name,
    i.reporter_user_id,
    reporter.email as reporter_email,
    reporter_profile.display_name as reporter_display_name,
    f.flagger_user_id,
    flagger.email as flagger_email,
    flagger_profile.display_name as flagger_display_name,
    g.name as game_name
  from public.flags f
  join public.incidents i on i.id = f.incident_id
  join public.players p on p.id = i.reported_player_id
  join public.incident_categories c on c.id = i.category_id
  join public.games g on g.id = i.game_id
  left join auth.users reporter on reporter.id = i.reporter_user_id
  left join public.user_profiles reporter_profile on reporter_profile.user_id = i.reporter_user_id
  left join auth.users flagger on flagger.id = f.flagger_user_id
  left join public.user_profiles flagger_profile on flagger_profile.user_id = f.flagger_user_id
  where 
    (status_filter = 'all' or f.status = status_filter)
    and public.fn_user_has_role('moderator')
  order by f.created_at asc
  limit greatest(lim, 1);
$$;

-- Comment on function
comment on function public.fn_get_flag_queue is 'Get flag queue for moderators with full incident and user context. Only accessible by moderators/admins.';
