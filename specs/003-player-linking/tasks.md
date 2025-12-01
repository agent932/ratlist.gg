# Player ID Linking System - Tasks

## Feature: 003-player-linking
**Goal**: Enable users to link in-game player IDs to their account, receive notifications when reported, and create clear separation between user accounts (`/user/[username]`) and player profiles (`/player/[playerId]`).

---

## Phase 1: Database Foundation

### Migration Tasks
- [ ] T001 Create player_links table migration in supabase/migrations/0011_player_links.sql
  - `player_links` table with columns: id, user_id, player_id, game_id, linked_at, verified
  - Unique constraint on (player_id, game_id) to prevent duplicate claims
  - Foreign keys to user_profiles and games tables with CASCADE delete
  - RLS policy: Users can insert/delete their own links
  - RLS policy: Admins can manage all links
  - Index on user_id for fast lookup

- [ ] T002 Create notification system migration in supabase/migrations/0012_notification_system.sql
  - `notification_queue` table: id, user_id, incident_id, sent, created_at, sent_at
  - Trigger function: fn_notify_linked_player_on_incident
  - Rate limiting: Reset notification_count_today daily via cron job
  - Email notification template references
  - RLS policy: Users can only read their own notifications

- [ ] T003 Update user_profiles migration in supabase/migrations/0013_user_profile_updates.sql
  - Add column: email_notifications (boolean, default true)
  - Add column: last_notification_sent (timestamptz)
  - Add column: notification_count_today (int, default 0)
  - Update user_profiles RLS policies to allow users to update their own notification prefs

---

## Phase 2: User Story 1 - Link Player IDs

### API Implementation
- [ ] T004 [P] [US1] Create link player API in app/(app)/api/user/link-player/route.ts
  - POST endpoint with Zod schema validation (player_id, game_id)
  - Require authentication via requireAuth()
  - Check if player_id already claimed by another user
  - Insert into player_links table
  - Return success with linked player data
  - Log action to moderation_logs (action: 'link_player')

- [ ] T005 [P] [US1] Create unlink player API in app/(app)/api/user/unlink-player/route.ts
  - DELETE endpoint with Zod schema (player_id, game_id)
  - Require authentication
  - Verify user owns the link before deleting
  - Delete from player_links table
  - Log action to moderation_logs (action: 'unlink_player')

### Database Functions
- [ ] T006 [US1] Create fn_get_linked_players in 0011_player_links.sql
  - Function signature: fn_get_linked_players(target_user_id uuid)
  - Returns table: player_id, game_name, linked_at, incident_count
  - Join player_links → games → incidents for stats
  - Security: Anyone can call, returns public data only

---

## Phase 3: User Story 4 - User Profile Page

### Page & Components
- [ ] T007 [US4] Create user profile page in app/user/[username]/page.tsx
  - Server component with getCurrentUserWithRole()
  - Fetch user data: display_name, email (if owner), role, join date
  - Fetch linked players via fn_get_linked_players
  - Show aggregate stats: total incidents across all players
  - Conditional rendering: Settings section only if current user is owner
  - Admin view: Show role badge, suspension status, management buttons

- [ ] T008 [P] [US4] Create UserProfileHeader component in components/features/user/UserProfileHeader.tsx
  - Props: displayName, joinDate, role, isOwner, emailNotifications
  - Display name with role badge (admin/moderator/user colors)
  - Join date formatted (e.g., "Joined Nov 2024")
  - If isOwner: Show notification toggle switch
  - Settings icon linking to notification preferences

- [ ] T009 [P] [US4] Create LinkedPlayerCard component in components/features/user/LinkedPlayerCard.tsx
  - Props: playerId, gameName, linkedAt, incidentCount, canUnlink
  - Card with game badge, player ID link to /player/[playerId]
  - Show linked date and incident count
  - If canUnlink: Show unlink button with confirmation dialog
  - onClick unlink: Call DELETE /api/user/unlink-player

- [ ] T010 [P] [US4] Create LinkPlayerForm component in components/features/user/LinkPlayerForm.tsx
  - Client component with useState for form state
  - Game dropdown (fetch from /api/games)
  - Player ID text input
  - Submit button calling POST /api/user/link-player
  - Success message and refresh linked players list
  - Error handling: "Player already claimed" message

### API for User Profile
- [ ] T011 [P] [US4] Create user profile data API in app/(app)/api/user/[username]/route.ts
  - GET endpoint returning user profile JSON
  - Public fields: display_name, join date, linked players, role
  - Private fields (if owner): email, notification preferences
  - Admin view: Include suspension status, management data
  - Use fn_get_linked_players for player list

---

## Phase 4: User Story 2 - Player Profile Ownership

### Player Page Updates
- [ ] T012 [US2] Create VerifiedBadge component in components/features/player/VerifiedBadge.tsx
  - Props: username, userId
  - Badge with checkmark icon: "Verified by [username]"
  - Link to /user/[username]
  - Tooltip: "This player is claimed by a registered user"
  - Styling: Green badge with verified icon

- [ ] T013 [US2] Update player profile page in app/player/[playerId]/page.tsx
  - Query player_links to check if player is claimed
  - If claimed: Pass username to VerifiedBadge component
  - Display badge next to player name in header
  - Update page metadata to include verified status

### Database Query
- [ ] T014 [US2] Create fn_get_player_ownership in 0011_player_links.sql
  - Function signature: fn_get_player_ownership(target_player_id text, target_game_id uuid)
  - Returns: user_id, display_name, linked_at, verified
  - Join player_links → user_profiles
  - Security: Public function, no auth required

---

## Phase 5: User Story 3 - Incident Notifications

### Notification Logic
- [ ] T015 [US3] Create notification toggle API in app/(app)/api/notifications/toggle/route.ts
  - POST endpoint with Zod schema (enabled: boolean)
  - Update user_profiles.email_notifications
  - Return updated preference
  - Require authentication

- [ ] T016 [US3] Implement incident notification trigger in 0012_notification_system.sql
  - Trigger: after INSERT on incidents table
  - Check if reported player is linked to a user
  - Check if user has email_notifications = true
  - Check rate limit: notification_count_today < 5
  - Insert into notification_queue if all checks pass
  - Increment notification_count_today

- [ ] T017 [US3] Create fn_send_pending_notifications function in 0012_notification_system.sql
  - Background job function (called via Supabase Edge Function or cron)
  - Select unsent notifications from queue
  - Send email via Supabase auth.send_email()
  - Mark notifications as sent
  - Update last_notification_sent timestamp

### Email Template
- [ ] T018 [US3] Create email notification template
  - Subject: "New incident report on [game]"
  - Body: Include reporter info, game, incident type, description
  - Link to player profile to view incident
  - Unsubscribe link pointing to user settings
  - Use Supabase auth email infrastructure

---

## Phase 6: Admin Integration

### Admin Pages
- [ ] T019 Fix admin users page link in app/admin/users/page.tsx
  - Change "View Profile" link from /player/[playerId] to /user/[username]
  - Update link logic to use display_name from user search results
  - Ensure correct routing to user profile page

- [ ] T020 [P] Add player link management to admin user page
  - Show linked players in admin user detail view
  - Admin action: Force unlink player (with reason)
  - Log force unlink to moderation_logs
  - Display warning: "Removing player link will transfer ownership"

---

## Phase 7: Testing & Validation

### End-to-End Tests
- [ ] T021 Test player linking flow
  - Login as user
  - Navigate to /user/[username]
  - Link a player ID for a game
  - Verify badge appears on /player/[playerId]
  - Check user profile shows linked player
  - Unlink player and verify removal

- [ ] T022 Test notification system
  - Link player to user account
  - Create incident report for that player
  - Check notification_queue has entry
  - Verify email sent (manual check or test inbox)
  - Create 5 more incidents and verify 6th doesn't send (rate limit)

### Security Tests
- [ ] T023 Test RLS policies
  - Attempt to link player as user A
  - Login as user B, try to unlink user A's player (should fail)
  - Login as admin, force unlink (should succeed)
  - Verify moderation_logs records admin action

---

## Summary

**Total Tasks**: 23  
**Phases**: 7  
**User Stories Covered**: 4 (P1-P4)

**Critical Path**:
1. Database migrations (T001-T003)
2. Link/Unlink APIs (T004-T006)
3. User profile page (T007-T011)
4. Player verification (T012-T014)
5. Fix admin page (T019)

**Parallel Opportunities**:
- T004, T005 can be done together (both API routes)
- T008, T009, T010 can be done together (UI components)
- T012, T013, T014 can be done together (player page updates)

**MVP Scope** (US1 + US4):
- T001-T011, T019 (Core linking + user profile)
- Skip notifications (T015-T018) for initial release
- Skip advanced testing (T021-T023) for MVP
