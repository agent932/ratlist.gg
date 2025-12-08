# Data Model: Email Notifications

**Feature**: 001-email-notifications  
**Created**: December 7, 2025

## Database Schema Changes

### New Columns for notification_queue

```sql
-- Migration: 0017_email_notification_retry.sql
-- Add retry tracking for email delivery failures

ALTER TABLE public.notification_queue
ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS permanently_failed BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for querying retryable notifications
CREATE INDEX IF NOT EXISTS idx_notification_queue_retryable
  ON public.notification_queue(retry_count, permanently_failed)
  WHERE sent = FALSE AND permanently_failed = FALSE;

COMMENT ON COLUMN public.notification_queue.retry_count IS 'Number of send attempts (max 3)';
COMMENT ON COLUMN public.notification_queue.last_retry_at IS 'Timestamp of last send attempt';
COMMENT ON COLUMN public.notification_queue.permanently_failed IS 'True if max retries exceeded';
```

**Rationale**: 
- `retry_count` tracks delivery attempts for exponential backoff calculation
- `last_retry_at` enables backoff timing (don't retry too soon)
- `permanently_failed` flags notifications that exceeded 3 retries for monitoring
- Index optimizes batch processor query for unsent, retryable notifications

---

## Entity Relationships

```
┌─────────────────┐
│  auth.users     │
│  (Supabase)     │
│  - id           │
│  - email        │◄────┐
└─────────────────┘     │
                        │
                        │
┌─────────────────────┐ │
│  user_profiles      │ │
│  - user_id (PK)     │─┘
│  - email_notif...   │
│  - notification_... │
│  - last_notifica... │
└─────────────────────┘
         ▲
         │
         │
         │
┌─────────────────────────────┐
│  notification_queue         │
│  - id (PK)                  │
│  - user_id (FK)             │◄───┐
│  - incident_id (FK)         │    │
│  - sent                     │    │
│  - sent_at                  │    │
│  - retry_count              │    │
│  - last_retry_at            │    │
│  - permanently_failed       │    │
│  - created_at               │    │
│  UNIQUE(user_id, incident_id) │    │
└─────────────────────────────┘    │
         │                         │
         │                         │
         ▼                         │
┌─────────────────────┐            │
│  incidents          │            │
│  - id (PK)          │────────────┘
│  - game_id (FK)     │
│  - reported_player_id│
│  - category_id      │
│  - description      │
│  - status           │
│  - created_at       │
└─────────────────────┘
         │
         │
         ▼
┌─────────────────────┐
│  players            │
│  - id (PK)          │
│  - identifier       │
│  - game_id          │
│  - display_name     │
└─────────────────────┘
         ▲
         │
         │
┌─────────────────────┐
│  player_links       │
│  - user_id (FK)     │
│  - player_id        │
│  - game_id          │
└─────────────────────┘
```

**Key Relationships**:
1. `notification_queue.user_id` → `user_profiles.user_id` (who to notify)
2. `notification_queue.incident_id` → `incidents.id` (what to notify about)
3. `user_profiles.user_id` → `auth.users.id` (email address source)
4. `incidents.reported_player_id` → `players.id` (which player got reported)
5. `player_links.player_id` → `players.identifier` (user's claimed players)

**Cascade Behavior**:
- If `incidents` deleted → `notification_queue` entries deleted (ON DELETE CASCADE)
- If `user_profiles` deleted → `notification_queue` entries deleted (ON DELETE CASCADE)

---

## Data Validation Rules

### Notification Queue Constraints

```typescript
// Server-side validation (not exposed as API input)
interface NotificationQueueRecord {
  id: string;                    // UUID, auto-generated
  user_id: string;               // FK to user_profiles, NOT NULL
  incident_id: string;           // FK to incidents, NOT NULL
  sent: boolean;                 // Default: false
  sent_at: string | null;        // Timestamp, nullable
  retry_count: number;           // Default: 0, max: 3
  last_retry_at: string | null;  // Timestamp, nullable
  permanently_failed: boolean;   // Default: false
  created_at: string;            // Auto-generated timestamp
}
```

**Business Rules**:
1. `UNIQUE(user_id, incident_id)` prevents duplicate notifications
2. `retry_count` never exceeds 3 (enforced by batch processor logic)
3. `permanently_failed = true` when `retry_count >= 3` and still unsent
4. `sent_at` only populated when `sent = true`

---

## State Transitions

```
┌──────────┐
│ Created  │  sent=false, retry_count=0
└────┬─────┘
     │
     ▼
┌────────────┐
│  Pending   │  sent=false, retry_count=0, waiting for batch processor
└────┬───────┘
     │
     ├──► Success Path ────────────────────────┐
     │                                         ▼
     │                                   ┌──────────┐
     │                                   │   Sent   │  sent=true, sent_at populated
     │                                   └──────────┘
     │
     ├──► Failure Path ──────────────────────┐
     │                                        ▼
     │                                  ┌──────────────┐
     │                                  │  Retrying    │  retry_count=1-2, last_retry_at updated
     │                                  └──────┬───────┘
     │                                         │
     │                                         ├──► Eventually Sent ──► ┌──────────┐
     │                                         │                         │   Sent   │
     │                                         │                         └──────────┘
     │                                         │
     │                                         └──► Max Retries ──────► ┌────────────────┐
     │                                                                  │ Permanently    │
     │                                                                  │ Failed         │
     │                                                                  │ retry_count=3  │
     │                                                                  │ perm_failed=t  │
     │                                                                  └────────────────┘
     │
     └──► User Disables Notifications ──────► ┌──────────────┐
                                               │  Skipped     │  Remains in queue but not sent
                                               └──────────────┘
```

**State Descriptions**:
- **Created**: Just inserted by trigger, not yet processed
- **Pending**: Waiting in queue for next batch run
- **Retrying**: Failed 1-2 times, will retry with backoff
- **Sent**: Successfully delivered
- **Permanently Failed**: Exceeded 3 retries, requires manual investigation
- **Skipped**: User disabled notifications after queue insertion

---

## Email Template Data Structure

### Email Props Interface

```typescript
interface IncidentNotificationEmailProps {
  // Recipient info
  userName: string;              // From user_profiles.display_name or email
  userEmail: string;             // From auth.users.email
  
  // Incident details
  incidentId: string;            // For tracking/linking
  playerIdentifier: string;      // Reported player name (WITHOUT discriminator)
  gameName: string;              // e.g., "Escape from Tarkov"
  categoryLabel: string;         // e.g., "Betrayal", "Clutch Save"
  description: string;           // Incident description text
  reportedAt: string;            // ISO timestamp of incident creation
  
  // UI links
  dashboardUrl: string;          // https://ratlist.gg/dashboard
  incidentUrl: string;           // https://ratlist.gg/dashboard#incident-{id}
  preferencesUrl: string;        // https://ratlist.gg/dashboard (with scroll to preferences)
  
  // Branding
  logoUrl: string;               // https://ratlist.gg/logo.png
  brandColor: string;            // From Tailwind config: hsl(var(--brand))
}
```

**Data Sources** (from `fn_send_pending_notifications()`):
- `userName`: `user_profiles.display_name` or fallback to `auth.users.email`
- `userEmail`: `auth.users.email`
- `playerIdentifier`: `players.identifier` (**redact discriminator if present**)
- `gameName`: `games.name`
- `categoryLabel`: `incident_categories.label`
- `description`: `incidents.description`
- `reportedAt`: `incidents.created_at`

**Privacy Notes**:
- Player discriminators MUST be redacted per Constitution Principle VI
- Reporter identity NOT included (respects anonymous reports)
- Email only sent if `auth.users.email IS NOT NULL`

---

## Updated Database Functions

### fn_send_pending_notifications (Enhanced)

```sql
-- Updated to include retry logic and failure tracking
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
```

**Logic Changes**:
- Added `retry_count` to output for logging
- Filter includes exponential backoff check: `last_retry_at < NOW() - INTERVAL '5min' * 2^retry_count`
- Excludes `permanently_failed = TRUE` records
- Respects `email_notifications = TRUE` preference at send time (not queue time)

---

### fn_mark_notification_sent (Enhanced)

```sql
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
```

**Enhanced Functionality**:
- Now accepts `success` boolean parameter
- On success: marks sent and updates user timestamp (original behavior)
- On failure: increments retry_count, updates last_retry_at, sets permanently_failed if retry_count >= 3

---

## Query Performance Considerations

### Indexes

```sql
-- Existing indexes (from migration 0012)
CREATE INDEX idx_notification_queue_user_id ON public.notification_queue(user_id);
CREATE INDEX idx_notification_queue_unsent ON public.notification_queue(sent) WHERE sent = FALSE;

-- New indexes (migration 0017)
CREATE INDEX idx_notification_queue_retryable 
  ON public.notification_queue(retry_count, permanently_failed)
  WHERE sent = FALSE AND permanently_failed = FALSE;
```

**Index Usage**:
- `idx_notification_queue_unsent`: Used by batch processor to find pending notifications
- `idx_notification_queue_retryable`: Optimizes retry logic queries
- `idx_notification_queue_user_id`: Used for user-specific notification queries (if needed for admin UI)

---

## Data Lifecycle

### Retention Policy

**Current**: Indefinite retention of all notifications (sent and failed)

**Decision**: Notifications are retained indefinitely for audit trail and compliance purposes. Database growth is acceptable given:
- Notifications are small records (~200 bytes each)
- Expected volume: ~100-1000 notifications/day = ~36k-365k records/year
- PostgreSQL easily handles millions of rows with proper indexing
- Retention enables historical analysis and debugging

**Future Enhancement** (Optional):
```sql
-- If table growth becomes problematic, implement 30-day cleanup:
DELETE FROM public.notification_queue
WHERE sent = TRUE 
  AND sent_at < NOW() - INTERVAL '30 days';
```

**Notes**: 
- Permanently failed notifications MUST be retained for investigation
- Sent notifications provide audit trail for compliance (GDPR data export requests)
- Consider archival to separate table if > 10M records accumulated

### Monitoring Queries

```sql
-- Count pending notifications
SELECT COUNT(*) FROM notification_queue WHERE sent = FALSE AND permanently_failed = FALSE;

-- Count permanently failed (needs investigation)
SELECT COUNT(*) FROM notification_queue WHERE permanently_failed = TRUE;

-- Average retry count for failed sends
SELECT AVG(retry_count) FROM notification_queue WHERE sent = FALSE AND retry_count > 0;

-- Notification volume by user (detect abuse)
SELECT user_id, COUNT(*) as notification_count
FROM notification_queue
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id
ORDER BY notification_count DESC
LIMIT 10;
```

---

## Summary

**Schema Changes**: 3 new columns to `notification_queue` table  
**New Indexes**: 1 composite index for retry logic  
**Function Updates**: Enhanced `fn_send_pending_notifications()` and `fn_mark_notification_sent()`  
**Entity Count**: 6 related entities (notification_queue, user_profiles, auth.users, incidents, players, player_links)  
**State Machine**: 6 states (Created, Pending, Retrying, Sent, Permanently Failed, Skipped)

**Next Steps**: API contract definition and cron endpoint specifications
