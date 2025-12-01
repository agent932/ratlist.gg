-- User Profile Updates for Notifications
-- Feature: 003-player-linking
-- T003: Add notification preferences to user_profiles

-- Add notification preference columns
alter table public.user_profiles
add column if not exists email_notifications boolean not null default true,
add column if not exists last_notification_sent timestamptz,
add column if not exists notification_count_today int not null default 0;

-- Create index for checking notification limits
create index if not exists idx_user_profiles_notification_count 
  on public.user_profiles(notification_count_today)
  where notification_count_today >= 5;

-- Update RLS policy to allow users to update their own notification preferences
drop policy if exists "user_profiles_update_own_policy" on public.user_profiles;
create policy "user_profiles_update_own_policy" on public.user_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Comments
comment on column public.user_profiles.email_notifications is 'Whether user wants email notifications for incidents on linked players';
comment on column public.user_profiles.last_notification_sent is 'Timestamp of last notification sent to user';
comment on column public.user_profiles.notification_count_today is 'Number of notifications sent today (reset at midnight UTC)';

-- Update fn_mark_notification_sent to include last_notification_sent
create or replace function public.fn_mark_notification_sent(notification_id uuid)
returns void
language sql
security definer
as $$
  update public.notification_queue
  set 
    sent = true,
    sent_at = now()
  where id = notification_id;
  
  update public.user_profiles up
  set last_notification_sent = now()
  from public.notification_queue nq
  where nq.id = notification_id
  and up.user_id = nq.user_id;
$$;

-- Function to reset daily notification counts (run via cron at midnight UTC)
create or replace function public.fn_reset_notification_counts()
returns void
language sql
security definer
as $$
  update public.user_profiles
  set notification_count_today = 0
  where notification_count_today > 0;
$$;

-- Comments
comment on function public.fn_reset_notification_counts is 'Reset daily notification counts (run at midnight UTC)';
