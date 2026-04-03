-- Ensure fn_search_users exists (was missing from local schema cache)
-- This function is defined in 0007_user_management.sql but may not have applied cleanly

CREATE OR REPLACE FUNCTION public.fn_search_users(
  query text DEFAULT '',
  role_filter text DEFAULT 'all',
  lim int DEFAULT 20
)
RETURNS TABLE (
  user_id uuid,
  email text,
  display_name text,
  role text,
  created_at timestamptz,
  incident_count bigint,
  flag_count bigint,
  suspended_until timestamptz,
  suspension_reason text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    up.user_id,
    u.email,
    up.display_name,
    up.role::text,
    up.created_at,
    COALESCE(incident_counts.count, 0) AS incident_count,
    COALESCE(flag_counts.count, 0) AS flag_count,
    up.suspended_until,
    up.suspension_reason
  FROM public.user_profiles up
  JOIN auth.users u ON u.id = up.user_id
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS count
    FROM public.incidents
    WHERE reporter_user_id = up.user_id
  ) incident_counts ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS count
    FROM public.flags
    WHERE flagger_user_id = up.user_id
  ) flag_counts ON true
  WHERE
    public.fn_user_has_role('admin')
    AND (query = '' OR u.email ILIKE '%' || query || '%' OR up.display_name ILIKE '%' || query || '%')
    AND (role_filter = 'all' OR up.role::text = role_filter)
  ORDER BY up.created_at DESC
  LIMIT GREATEST(lim, 1);
$$
