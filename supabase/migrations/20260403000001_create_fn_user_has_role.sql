-- Recreate fn_user_has_role which was missing from production
-- This function checks if the current user has the required role or higher
-- Role hierarchy: user(1) < moderator(2) < admin(3)

CREATE OR REPLACE FUNCTION public.fn_user_has_role(target_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_current_role text;
  role_hierarchy jsonb := '{"user": 1, "moderator": 2, "admin": 3}'::jsonb;
BEGIN
  SELECT role::text INTO user_current_role
  FROM public.user_profiles
  WHERE user_id = auth.uid();

  IF user_current_role IS NULL THEN
    RETURN false;
  END IF;

  RETURN (role_hierarchy->user_current_role)::int >= (role_hierarchy->target_role)::int;
END;
$$;
