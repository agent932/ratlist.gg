-- Fix fn_get_flag_queue to support status_filter='all' for the All Flags tab
-- Restores full join version from 0004_enhance_flags while keeping the 'all' fix

DROP FUNCTION IF EXISTS public.fn_get_flag_queue(text, integer);

CREATE OR REPLACE FUNCTION public.fn_get_flag_queue(status_filter text DEFAULT 'open', lim int DEFAULT 20)
RETURNS TABLE (
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
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    f.id AS flag_id,
    f.reason AS flag_reason,
    f.status AS flag_status,
    f.created_at AS flag_created_at,
    f.reviewed_by AS flag_reviewed_by,
    f.reviewed_at AS flag_reviewed_at,
    f.resolution AS flag_resolution,
    i.id AS incident_id,
    i.description AS incident_description,
    c.label AS incident_category_label,
    i.created_at AS incident_created_at,
    p.id AS reported_player_id,
    p.identifier AS reported_player_identifier,
    p.display_name AS reported_player_display_name,
    i.reporter_user_id,
    reporter.email AS reporter_email,
    reporter_profile.display_name AS reporter_display_name,
    f.flagger_user_id,
    flagger.email AS flagger_email,
    flagger_profile.display_name AS flagger_display_name,
    g.name AS game_name
  FROM public.flags f
  JOIN public.incidents i ON i.id = f.incident_id
  JOIN public.players p ON p.id = i.reported_player_id
  JOIN public.incident_categories c ON c.id = i.category_id
  JOIN public.games g ON g.id = i.game_id
  LEFT JOIN auth.users reporter ON reporter.id = i.reporter_user_id
  LEFT JOIN public.user_profiles reporter_profile ON reporter_profile.user_id = i.reporter_user_id
  LEFT JOIN auth.users flagger ON flagger.id = f.flagger_user_id
  LEFT JOIN public.user_profiles flagger_profile ON flagger_profile.user_id = f.flagger_user_id
  WHERE
    (status_filter = 'all' OR f.status = status_filter)
    AND public.fn_user_has_role('moderator')
  ORDER BY f.created_at ASC
  LIMIT GREATEST(lim, 1);
$$;

COMMENT ON FUNCTION public.fn_get_flag_queue IS 'Get flag queue for moderators with full incident and user context. Supports status_filter=''all'' for all flags tab.';
