# Feature Specification: Email Notifications for Incident Reports

**Feature Branch**: `001-email-notifications`  
**Created**: December 7, 2025  
**Status**: Draft  
**Input**: User description: "Implement email notifications for users that have an account when a new incident is reported"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Receive Email When Linked Player Gets Reported (Priority: P1)

A user who has linked their game player identifier to their Ratlist.gg account should receive an email notification whenever a new incident is reported against that player. This allows users to stay informed about their reputation and respond to reports in a timely manner.

**Why this priority**: This is the core feature - without email delivery, users cannot receive notifications. This provides the primary value of staying informed about incidents affecting their reputation.

**Independent Test**: User can link a player identifier to their account, have another user submit an incident report against that player, and verify they receive an email notification within 5 minutes containing incident details.

**Acceptance Scenarios**:

1. **Given** a user has linked player "TacticalGamer123" for Escape from Tarkov to their account, **When** another user reports a betrayal incident against "TacticalGamer123", **Then** the user receives an email with incident category, game name, and description within 5 minutes
2. **Given** a user has email notifications enabled in their profile, **When** an incident is reported against their linked player, **Then** the notification is queued in the database and marked for sending
3. **Given** a user receives an email notification, **When** they click the link in the email, **Then** they are directed to their dashboard showing the new incident

---

### User Story 2 - Control Notification Preferences (Priority: P2)

Users should be able to toggle email notifications on or off from their dashboard, allowing them to opt out of notifications while keeping their player links active. This gives users control over their communication preferences.

**Why this priority**: User control over notifications is essential for a good experience, but the system can function without it (defaulting to notifications enabled). This prevents users from disabling notifications they don't want.

**Independent Test**: User can navigate to their dashboard, toggle the email notifications switch, and verify that no emails are sent when incidents are reported while notifications are disabled.

**Acceptance Scenarios**:

1. **Given** a user has email notifications enabled, **When** they toggle the notification switch to "off", **Then** their preference is saved and no emails are sent for new incidents
2. **Given** a user has disabled email notifications, **When** they toggle the notification switch to "on", **Then** their preference is saved and emails resume for new incidents
3. **Given** a user changes notification settings, **When** the page refreshes, **Then** the toggle reflects the current saved preference

---

### User Story 3 - Rate Limiting Protection (Priority: P3)

The system should protect users from notification spam by limiting the number of emails sent per day (maximum 5 notifications per 24 hours). This prevents abuse and ensures users aren't overwhelmed by excessive notifications.

**Why this priority**: Protection against spam is important for user experience, but the feature delivers value even without rate limiting. This can be implemented after basic notification delivery works.

**Independent Test**: Generate 10 incidents against a user's linked player within 24 hours and verify only 5 email notifications are sent, with remaining incidents queued but not delivered until the next day.

**Acceptance Scenarios**:

1. **Given** a user has received 5 email notifications today, **When** a 6th incident is reported against their linked player, **Then** no email is sent but the incident still appears in their dashboard
2. **Given** a user hit their daily notification limit yesterday, **When** the next day begins (midnight UTC), **Then** their notification count resets and they can receive up to 5 new notifications
3. **Given** multiple incidents are reported simultaneously, **When** the notification queue processes them, **Then** only the first 5 are sent as emails with the rest held until the next day

---

### User Story 4 - Batch Email Processing (Priority: P3)

The system should process queued email notifications in batches via a scheduled background job (every 5 minutes), ensuring reliable delivery without blocking the incident submission flow. This separates notification processing from the main application workflow.

**Why this priority**: Batching improves reliability and performance, but immediate (unbatched) sending would still provide value. This optimization ensures the system scales well.

**Independent Test**: Submit multiple incidents across different users and verify that emails are sent in batches every 5 minutes, with delivery logs showing successful sends.

**Acceptance Scenarios**:

1. **Given** 20 incidents are reported by various users, **When** the batch processor runs, **Then** all queued notifications are processed and marked as sent within one batch cycle
2. **Given** an email delivery fails for a specific notification, **When** the batch processor runs again, **Then** the failed notification is retried up to 3 times before being marked as permanently failed
3. **Given** a notification has been successfully sent, **When** checking the notification_queue table, **Then** the record is marked with sent=true and sent_at timestamp is populated

---

### Edge Cases

- What happens when a user has no email address in their auth profile (e.g., OAuth login without email)?
  - System checks for null email addresses and skips notification queue insertion, logging a warning
- How does the system handle email delivery failures (invalid addresses, bounces, provider errors)?
  - Failed sends are retried up to 3 times with exponential backoff (5 min, 15 min, 45 min), then marked as permanently failed
- What happens if a user disables notifications while emails are already queued?
  - Queued notifications are retained but not sent; user preference is checked at send time, not queue time
- How are duplicate notifications prevented if the same incident triggers multiple queue insertions?
  - Database unique constraint on (user_id, incident_id) prevents duplicate queue entries
- What happens if an incident is deleted before its notification email is sent?
  - Database cascade delete removes notification_queue entries when incident is deleted
- How does the system behave during email service outages?
  - Notifications remain queued and unsent; batch processor logs errors and retries on next cycle
- What happens when a user reaches their daily limit at 11:59 PM?
  - Count resets at midnight UTC; pending notifications from previous day are sent starting at 12:00 AM
- How are notifications handled for users with multiple linked players?
  - Each player link is independent; user receives separate notifications for incidents on each linked player (subject to daily limit across all notifications)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST send email notifications to users when an incident is reported against their linked player identifier
- **FR-002**: System MUST include incident category, game name, description, and link to dashboard in notification emails
- **FR-003**: System MUST provide a user-accessible toggle to enable or disable email notifications in their dashboard
- **FR-004**: System MUST respect user notification preferences by checking email_notifications flag before sending
- **FR-005**: System MUST limit users to a maximum of 5 email notifications per 24-hour period (midnight to midnight UTC)
- **FR-006**: System MUST reset daily notification counts at midnight UTC using a scheduled job
- **FR-007**: System MUST process queued notifications in batches every 5 minutes using a background job
- **FR-008**: System MUST mark notifications as sent in the database with sent=true and sent_at timestamp
- **FR-009**: System MUST prevent duplicate notifications for the same incident using database constraints
- **FR-010**: System MUST retry failed email sends up to 3 times with exponential backoff (5min, 15min, 45min)
- **FR-011**: System MUST use Resend email service for sending notification emails
- **FR-012**: System MUST format emails using HTML templates with Ratlist.gg branding and game theming
- **FR-013**: System MUST skip notification sending for users without valid email addresses in their auth profile
- **FR-014**: System MUST log all email sending attempts, successes, and failures for monitoring and debugging
- **FR-015**: System MUST handle email service provider errors gracefully without blocking other notifications in the batch

### Key Entities *(include if feature involves data)*

- **Notification Queue**: Records pending email notifications with user_id, incident_id, sent status, and timestamps. Links to user_profiles and incidents tables. Enforces unique constraint on (user_id, incident_id) to prevent duplicates.

- **User Profile**: Contains email notification preferences (email_notifications boolean), daily notification count tracking (notification_count_today), and timestamp of last notification sent (last_notification_sent).

- **Email Template**: HTML email structure containing incident details (category, game, description), user name, link to dashboard, and Ratlist.gg branding with unsubscribe/preference management links.

- **Batch Processor Job**: Scheduled Edge Function or cron job that runs every 5 minutes, queries unsent notifications via fn_send_pending_notifications(), sends emails via Resend API, and marks successful sends via fn_mark_notification_sent().

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users receive email notifications within 5 minutes of an incident being reported against their linked player
- **SC-002**: Email notification toggle in user dashboard updates preferences in under 2 seconds with visual confirmation
- **SC-003**: System successfully delivers 95% of queued email notifications within one batch cycle (5 minutes)
- **SC-004**: Daily notification rate limiting prevents any user from receiving more than 5 emails in a 24-hour period
- **SC-005**: Failed email deliveries are retried automatically without manual intervention in 100% of cases
- **SC-006**: Email open rate reaches at least 40% within first 24 hours of delivery (tracked via email service analytics)
- **SC-007**: Less than 2% of users disable email notifications within first week of receiving them
- **SC-008**: Batch processing handles 1000+ queued notifications in a single cycle without performance degradation

## Assumptions *(optional)*

- Users who link player identifiers want to be notified about incidents by default (email_notifications defaults to true)
- Resend email service provides adequate free tier limits for initial rollout (100 emails/day minimum)
- Supabase Edge Functions can reliably execute scheduled jobs every 5 minutes without significant drift
- Users access their email at least daily and will find notifications timely within 5-minute delivery SLA
- HTML email templates will render correctly across major email clients (Gmail, Outlook, Apple Mail, etc.)
- Email deliverability rate through Resend will be at least 95% for valid addresses
- Daily notification limit of 5 emails is sufficient for most users and prevents spam perception
- Midnight UTC reset time is acceptable across all user timezones without confusion
- Users will understand that disabling notifications doesn't unlink their players, only stops emails
- Incident descriptions are safe to include in emails without additional sanitization beyond database validation

## Dependencies *(optional)*

- **Supabase Database**: Notification queue table, user profiles table, and trigger functions are already implemented in migrations 0012 and 0013
- **Supabase Auth**: Requires auth.users table for accessing user email addresses
- **Resend Email Service**: Third-party email delivery provider with API for sending transactional emails
- **Vercel Cron Jobs**: For scheduling batch notification processor to run every 5 minutes (research phase selected Vercel Cron over Supabase Edge Functions for reliability and native platform integration)
- **React Email**: Email template library for generating HTML emails with React components and TypeScript support
- **User Dashboard**: Existing dashboard UI for displaying notification toggle control
- **Player Linking Feature**: Prerequisite feature that allows users to link game identifiers to their account

## Out of Scope *(optional)*

- In-app push notifications (web or mobile)
- SMS or text message notifications
- Real-time (instant) email delivery - batch processing with 5-minute intervals is acceptable
- Notification digest emails (daily/weekly summaries) - only individual incident notifications
- Filtering notifications by incident category or severity
- Notification history UI showing past emails sent
- Webhook integrations for notifications
- Customizable email templates per user
- Multi-language email templates
- Email notification scheduling or quiet hours
- Forwarding notifications to additional email addresses beyond the auth.users email
