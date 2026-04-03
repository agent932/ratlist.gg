-- Fix missing SELECT policy on user_profiles
-- The original policy in 0003 used fn_user_has_role which had type issues,
-- causing the SELECT policy to never be applied.
-- User profiles are intentionally public; sensitive field filtering is done at the API layer.

DROP POLICY IF EXISTS user_profiles_select_policy ON public.user_profiles;

CREATE POLICY user_profiles_select_policy ON public.user_profiles
  FOR SELECT
  USING (true);
