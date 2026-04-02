-- Migration: 0017_email_notification_retry.sql
-- Add retry tracking for email delivery failures
-- Feature: 001-email-notifications
-- Created: 2025-12-07

-- Add retry tracking columns to notification_queue
ALTER TABLE public.notification_queue
ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS permanently_failed BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for querying retryable notifications
CREATE INDEX IF NOT EXISTS idx_notification_queue_retryable
  ON public.notification_queue(retry_count, permanently_failed)
  WHERE sent = FALSE AND permanently_failed = FALSE;

-- Add column comments for documentation
COMMENT ON COLUMN public.notification_queue.retry_count IS 'Number of send attempts (max 3)';
COMMENT ON COLUMN public.notification_queue.last_retry_at IS 'Timestamp of last send attempt';
COMMENT ON COLUMN public.notification_queue.permanently_failed IS 'True if max retries exceeded';

-- Update fn_send_pending_notifications to include retry logic
CREATE OR REPLACE FUNCTION public.fn_send_pending_notifications()
RETURNS TABLE (
  notification_id uuid,
  user_email text,
  user_name text,
  incident_id uuid,
  player_identifier text,
  game_name text,
  category_label text,
  description text,
  reported_at timestamptz,
  retry_count int
)
LANGUAGE sql
SECURITY definer
AS $$
  SELECT 
    nq.id AS notification_id,
    u.email AS user_email,
    COALESCE(up.display_name, u.email) AS user_name,
    i.id AS incident_id,
    p.identifier AS player_identifier,
    g.name AS game_name,
    c.label AS category_label,
    i.description AS description,
    i.created_at AS reported_at,
    nq.retry_count
  FROM public.notification_queue nq
  JOIN public.user_profiles up ON up.user_id = nq.user_id
  JOIN auth.users u ON u.id = up.user_id
  JOIN public.incidents i ON i.id = nq.incident_id
  JOIN public.players p ON p.id = i.reported_player_id
  JOIN public.games g ON g.id = i.game_id
  JOIN public.incident_categories c ON c.id = i.category_id
  WHERE nq.sent = FALSE
    AND nq.permanently_failed = FALSE
    AND up.email_notifications = TRUE
    AND u.email IS NOT NULL
    AND (
      nq.retry_count = 0 
      OR (nq.last_retry_at IS NOT NULL AND nq.last_retry_at < NOW() - INTERVAL '5 minutes' * POWER(2, nq.retry_count))
    )
  ORDER BY nq.created_at ASC
  LIMIT 100;
$$;

-- Update fn_mark_notification_sent to handle success/failure
CREATE OR REPLACE FUNCTION public.fn_mark_notification_sent(
  notification_id uuid,
  success boolean DEFAULT TRUE
)
RETURNS void
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  IF success THEN
    -- Successful send
    UPDATE public.notification_queue
    SET 
      sent = TRUE,
      sent_at = NOW()
    WHERE id = notification_id;
    
    -- Update user's last notification timestamp
    UPDATE public.user_profiles up
    SET last_notification_sent = NOW()
    FROM public.notification_queue nq
    WHERE nq.id = notification_id
      AND up.user_id = nq.user_id;
  ELSE
    -- Failed send - increment retry count
    UPDATE public.notification_queue
    SET 
      retry_count = retry_count + 1,
      last_retry_at = NOW(),
      permanently_failed = CASE WHEN retry_count + 1 >= 3 THEN TRUE ELSE FALSE END
    WHERE id = notification_id;
  END IF;
END;
$$;

-- Add fn_reset_notification_counts for daily counter reset
CREATE OR REPLACE FUNCTION public.fn_reset_notification_counts()
RETURNS TABLE (users_reset int)
LANGUAGE plpgsql
SECURITY definer
AS $$
DECLARE
  reset_count int;
BEGIN
  -- Reset notification_count_today for all users
  UPDATE public.user_profiles
  SET notification_count_today = 0
  WHERE notification_count_today > 0;
  
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  
  RETURN QUERY SELECT reset_count;
END;
$$;
