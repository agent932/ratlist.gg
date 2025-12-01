-- Notification System for Player Linking
-- Feature: 003-player-linking
-- T002, T016, T017: Notification queue, triggers, and email sending

-- Create notification_queue table
create table if not exists public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(user_id) on delete cascade,
  incident_id uuid not null references public.incidents(id) on delete cascade,
  sent boolean not null default false,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  
  -- Prevent duplicate notifications for same incident
  unique(user_id, incident_id)
);

-- Create indexes
create index if not exists idx_notification_queue_user_id on public.notification_queue(user_id);
create index if not exists idx_notification_queue_unsent on public.notification_queue(sent) where sent = false;

-- Enable RLS
alter table public.notification_queue enable row level security;

-- RLS Policy: Users can only read their own notifications
drop policy if exists "notification_queue_select_policy" on public.notification_queue;
create policy "notification_queue_select_policy" on public.notification_queue
  for select
  using (auth.uid() = user_id);

-- RLS Policy: Admins can view all notifications
drop policy if exists "notification_queue_admin_policy" on public.notification_queue;
create policy "notification_queue_admin_policy" on public.notification_queue
  for all
  using (public.fn_user_has_role('admin'));

-- T016: Trigger function to queue notifications when incident is created
create or replace function public.fn_notify_linked_player_on_incident()
returns trigger
language plpgsql
security definer
as $$
declare
  linked_user_id uuid;
  user_notifications_enabled boolean;
  user_notification_count int;
  reported_player_identifier text;
begin
  -- Get the player identifier from the reported_player_id
  select p.identifier into reported_player_identifier
  from public.players p
  where p.id = new.reported_player_id;
  
  -- If no player found, exit early
  if reported_player_identifier is null then
    return new;
  end if;
  
  -- Check if the reported player is linked to a user account
  select pl.user_id into linked_user_id
  from public.player_links pl
  where pl.player_id = reported_player_identifier
  and pl.game_id = new.game_id
  limit 1;
  
  -- If no linked user, exit early
  if linked_user_id is null then
    return new;
  end if;
  
  -- Check if user has notifications enabled
  select 
    up.email_notifications,
    up.notification_count_today
  into 
    user_notifications_enabled,
    user_notification_count
  from public.user_profiles up
  where up.user_id = linked_user_id;
  
  -- If notifications disabled or rate limit exceeded, exit
  if not user_notifications_enabled or user_notification_count >= 5 then
    return new;
  end if;
  
  -- Queue the notification
  insert into public.notification_queue (user_id, incident_id)
  values (linked_user_id, new.id)
  on conflict (user_id, incident_id) do nothing;
  
  -- Increment daily notification count
  update public.user_profiles
  set notification_count_today = notification_count_today + 1
  where user_id = linked_user_id;
  
  return new;
end;
$$;

-- Create trigger on incidents table
drop trigger if exists on_incident_created_notify on public.incidents;
create trigger on_incident_created_notify
  after insert on public.incidents
  for each row
  execute function public.fn_notify_linked_player_on_incident();

-- T017: Function to send pending notifications (called by cron or edge function)
create or replace function public.fn_send_pending_notifications()
returns table (
  notification_id uuid,
  user_email text,
  incident_id uuid,
  player_id text,
  game_name text
)
language sql
security definer
as $$
  select 
    nq.id as notification_id,
    u.email as user_email,
    i.id as incident_id,
    p.identifier as player_id,
    g.name as game_name
  from public.notification_queue nq
  join public.user_profiles up on up.user_id = nq.user_id
  join auth.users u on u.id = up.user_id
  join public.incidents i on i.id = nq.incident_id
  join public.players p on p.id = i.reported_player_id
  join public.games g on g.id = i.game_id
  where nq.sent = false
  and u.email is not null
  order by nq.created_at asc
  limit 100;
$$;

-- Helper function to mark notification as sent
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
$$;

-- Comments
comment on table public.notification_queue is 'Queue of pending email notifications for incident reports on linked players';
comment on function public.fn_notify_linked_player_on_incident is 'Trigger function to queue notifications when linked player receives incident';
comment on function public.fn_send_pending_notifications is 'Get pending notifications to send via email (called by background job)';
comment on function public.fn_mark_notification_sent is 'Mark notification as sent and update user timestamp';
