-- Admin/moderator notification preferences table
CREATE TABLE IF NOT EXISTS public.admin_notification_prefs (
  user_id              uuid PRIMARY KEY REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  notify_new_flag      boolean NOT NULL DEFAULT true,
  notify_flag_resolved boolean NOT NULL DEFAULT false,
  notify_new_user      boolean NOT NULL DEFAULT true,
  notify_user_suspended boolean NOT NULL DEFAULT true,
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notification_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_notif_prefs_admin_all" ON public.admin_notification_prefs
  FOR ALL USING (public.fn_user_has_role('admin'));

CREATE POLICY "admin_notif_prefs_self" ON public.admin_notification_prefs
  FOR ALL USING (auth.uid() = user_id);

-- Auto-provision prefs when a user is elevated to mod/admin
CREATE OR REPLACE FUNCTION public.fn_provision_admin_notif_prefs()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.role IN ('moderator', 'admin') THEN
    INSERT INTO public.admin_notification_prefs (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_role_elevated_provision_notif_prefs ON public.user_profiles;
CREATE TRIGGER on_role_elevated_provision_notif_prefs
  AFTER INSERT OR UPDATE OF role ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.fn_provision_admin_notif_prefs();

-- Backfill existing mods/admins
INSERT INTO public.admin_notification_prefs (user_id)
SELECT user_id FROM public.user_profiles WHERE role IN ('moderator', 'admin')
ON CONFLICT DO NOTHING;

-- Admin alert queue for DB-trigger-sourced events (new user registrations)
CREATE TABLE IF NOT EXISTS public.admin_alert_queue (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  text NOT NULL,
  payload     jsonb NOT NULL DEFAULT '{}',
  sent        boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_alert_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_alert_queue_admin_all" ON public.admin_alert_queue
  FOR ALL USING (public.fn_user_has_role('admin'));

-- Trigger: queue admin alert when a new user_profile is created
CREATE OR REPLACE FUNCTION public.fn_queue_new_user_alert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.admin_alert_queue (event_type, payload)
  VALUES (
    'new_user',
    jsonb_build_object(
      'user_id', NEW.user_id::text,
      'display_name', NEW.display_name,
      'created_at', NEW.created_at
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_user_profile_queue_alert ON public.user_profiles;
CREATE TRIGGER on_new_user_profile_queue_alert
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  WHEN (NEW.role = 'user')
  EXECUTE FUNCTION public.fn_queue_new_user_alert();
