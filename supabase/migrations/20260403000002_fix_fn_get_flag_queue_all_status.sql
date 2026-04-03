-- Fix fn_get_flag_queue to support status_filter='all' for the All Flags tab
-- Previously used WHERE f.status = status_filter which returned 0 rows for 'all'

DROP FUNCTION IF EXISTS public.fn_get_flag_queue(text, integer);

CREATE FUNCTION public.fn_get_flag_queue(status_filter text, lim int)
RETURNS TABLE (
  id uuid,
  flagger_user_id text,
  flagger_name text,
  incident_id uuid,
  reason text,
  status text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    f.id,
    f.flagger_user_id::text,
    COALESCE(up.display_name, 'Anonymous') as flagger_name,
    f.incident_id,
    f.reason,
    f.status,
    f.created_at
  FROM public.flags f
  LEFT JOIN public.user_profiles up ON up.user_id = f.flagger_user_id
  WHERE status_filter = 'all' OR f.status = status_filter
  ORDER BY f.created_at DESC
  LIMIT lim;
$$;
