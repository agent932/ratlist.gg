---
description: "Task list for admin and moderator backend features"
---

# Tasks: Admin & Moderator Backend

**Input**: Plan and spec documents from `/specs/001-foundation/` (foundation requirements)
**Feature**: Admin dashboard and moderator tools for content management
**Prerequisites**: Foundation phase complete (all P1 user stories working)

**Tests**: Per the Constitution, smoke tests are REQUIRED:
- Unit tests for permission checks and policy enforcement
- E2E tests for moderator workflows (flag review, incident removal)

**Organization**: Tasks are grouped by feature area to enable independent implementation

## Format: `[ID] [P?] [Area] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Area]**: Feature area (AUTH, FLAGS, INCIDENTS, USERS, ADMIN, REPORTS)
- Include exact file paths in descriptions

---

## Phase 1: Authentication & Authorization (Foundation)

**Purpose**: Role-based access control for admin and moderator actions

- [X] M001 [AUTH] Add `role` column to `user_profiles` table with enum: `user`, `moderator`, `admin`
  - Path: `supabase/migrations/0003_add_user_roles.sql`
  - Default role: `user`
  - Add index on role for fast filtering
  
- [X] M002 [AUTH] Create RPC function `fn_user_has_role(target_role text)` to check current user's role
  - Path: `supabase/migrations/0003_add_user_roles.sql`
  - Returns boolean: true if user has target role or higher (admin > moderator > user)
  
- [X] M003 [P] [AUTH] Update RLS policies for moderator/admin access to sensitive data
  - Path: `supabase/migrations/0003_add_user_roles.sql`
  - Moderators can see reporter_user_id on incidents
  - Moderators can see flagger_user_id on flags
  - Admins can see all user_profiles data
  
- [X] M004 [P] [AUTH] Create admin route middleware/guard
  - Path: `lib/auth/guards.ts`
  - Functions: `requireModerator()`, `requireAdmin()`
  - Used in route handlers to protect admin endpoints
  
- [X] M005 [P] [AUTH] Create role assignment API for admins only
  - Path: `app/(app)/api/admin/users/[userId]/role/route.ts`
  - POST to change user role (admin only)
  - Input validation with Zod
  - Audit logging

**Checkpoint**: Role system ready - moderator features can be implemented

---

## Phase 2: Flag Management System

**Purpose**: Moderators can review and act on flagged content

- [X] M006 [FLAGS] Update flags table schema with moderator fields
  - Path: `supabase/migrations/0004_enhance_flags.sql`
  - Add columns: `reviewed_by` (uuid fk -> user_profiles), `reviewed_at` (timestamptz), `resolution` (text: 'dismissed', 'removed_incident', 'warned_reporter')
  - Add index on (`status`, `created_at`) for queue sorting
  
- [X] M007 [FLAGS] Create RPC `fn_get_flag_queue(status_filter text, limit int)`
  - Path: `supabase/migrations/0004_enhance_flags.sql`
  - Returns flags with incident details, flagger info, reporter info
  - Ordered by created_at ASC (oldest first)
  - Only callable by moderators (RLS policy)
  
- [X] M008 [P] [FLAGS] Build flag review API endpoint
  - Path: `app/(app)/api/moderator/flags/[flagId]/route.ts`
  - GET: Fetch single flag with full context
  - PATCH: Update flag status/resolution (moderator only)
  - Requires moderator role guard
  
- [X] M009 [P] [FLAGS] Build flag queue page for moderators
  - Path: `app/(moderator)/flags/page.tsx`
  - Server-side fetch via `fn_get_flag_queue`
  - Tab filters: Open, Reviewed, Dismissed
  - Shows incident content, flag reason, flagger/reporter info
  - Action buttons: Dismiss, Remove Incident, Warn Reporter
  
- [X] M010 [FLAGS] Flag detail modal/page with full incident context
  - Path: `components/features/moderation/FlagDetail.tsx`
  - Shows full incident description
  - Reporter history (recent incidents count)
  - Flagger history (flag accuracy rate if tracked)
  - Action buttons with confirmation dialogs

**Checkpoint**: Moderators can review and act on flags

---

## Phase 3: Incident Management

**Purpose**: Moderators can hide, remove, or restore incidents

- [X] M011 [INCIDENTS] Add moderation fields to incidents table
  - Path: `supabase/migrations/0005_incident_moderation.sql`
  - Add columns: `status` (text: 'active', 'hidden', 'removed'), `moderated_by` (uuid), `moderated_at` (timestamptz), `moderation_reason` (text)
  - Default status: 'active'
  - Add index on status for filtering
  
- [X] M012 [INCIDENTS] Update incident queries to filter by status
  - Path: `supabase/migrations/0005_incident_moderation.sql`
  - Update `fn_get_player_profile` to exclude 'removed' incidents
  - Update `fn_get_recent_incidents` to exclude 'removed' incidents
  - Optionally include 'hidden' with moderator context
  
- [X] M013 [P] [INCIDENTS] Create incident moderation API
  - Path: `app/(app)/api/moderator/incidents/[incidentId]/route.ts`
  - PATCH: Update incident status (hide/remove/restore)
  - Requires moderator role
  - Validates reason provided for removal
  - Logs moderation action
  
- [X] M014 [P] [INCIDENTS] Add moderation actions to incident display components
  - Path: `components/features/incident-list/IncidentCard.tsx`
  - Show moderation status badge if hidden/removed (moderator view only)
  - Add action menu for moderators: Hide, Remove, Restore
  - Confirmation dialog before destructive actions
  
- [X] M015 [INCIDENTS] Create moderation history log table
  - Path: `supabase/migrations/0005_incident_moderation.sql`
  - Columns: `id`, `moderator_id`, `action` (text: 'hide_incident', 'remove_incident', 'restore_incident', 'dismiss_flag', etc.), `target_type` (text: 'incident', 'flag', 'user'), `target_id` (uuid), `reason` (text), `created_at`
  - Insert trigger on incidents/flags updates to auto-log
  
- [X] M016 [P] [INCIDENTS] Create batch moderation endpoint
  - Path: `app/(app)/api/moderator/incidents/batch/route.ts`
  - POST: Accept array of incident IDs and action
  - Useful for removing multiple spam incidents at once
  - Requires admin role (more powerful than single-incident moderation)

**Checkpoint**: Moderators can manage incident lifecycle

---

## Phase 4: User Management

**Purpose**: Admins can view, search, and moderate users

- [X] M017 [USERS] Create RPC `fn_search_users(query text, role_filter text, limit int)`
  - Path: `supabase/migrations/0007_user_management.sql`
  - Search by email, display_name
  - Filter by role
  - Returns user profile + stats (incident count, flag count)
  - Admin only
  
- [X] M018 [P] [USERS] Build user search API
  - Path: `app/(app)/api/admin/users/search/route.ts`
  - GET with query params: q, role, limit
  - Returns user list with stats
  - Admin role required
  
- [X] M019 [P] [USERS] Build user detail page for admins
  - Path: `app/(admin)/users/[userId]/page.tsx`
  - Shows user profile, role, registration date
  - Lists all incidents submitted by user
  - Lists all flags submitted by user
  - Action buttons: Change Role, Suspend User (if implementing suspension)
  
- [X] M020 [USERS] Add user suspension system (optional)
  - Path: `supabase/migrations/0007_user_management.sql`
  - Add `suspended_until` (timestamptz nullable) to user_profiles
  - Add `suspension_reason` (text)
  - RLS policy: suspended users can't INSERT incidents/flags
  - API endpoint: `app/(app)/api/admin/users/[userId]/suspend/route.ts`
  
- [X] M021 [P] [USERS] Create user activity timeline component
  - Path: `components/features/admin/UserActivityTimeline.tsx`
  - Shows chronological list of user actions (incidents, flags, moderation actions on them)
  - Useful for identifying patterns of abuse

**Checkpoint**: Admins can search and manage users

---

## Phase 5: Admin Dashboard

**Purpose**: Overview and analytics for admins and moderators

- [X] M022 [ADMIN] Create dashboard stats RPC
  - Path: `supabase/migrations/0009_admin_dashboard.sql`
  - Function: `fn_get_admin_stats()`
  - Returns: open flags count, incidents today, users today, total incidents, total users, incidents by game (last 7 days)
  
- [X] M023 [P] [ADMIN] Build admin dashboard page
  - Path: `app/(admin)/dashboard/page.tsx`
  - Server-side fetch via `fn_get_admin_stats`
  - Cards: Open Flags (link to queue), Recent Activity, User Growth, Incident Volume
  - Charts: Incidents per game (last 7 days), Flag resolution rates
  
- [X] M024 [P] [ADMIN] Create moderation queue summary widget
  - Path: `components/features/admin/ModerationQueueSummary.tsx`
  - Shows count of open flags by severity/age
  - Quick links to flag queue filtered views
  
- [X] M025 [P] [ADMIN] Build recent activity feed
  - Path: `components/features/admin/RecentActivityFeed.tsx`
  - Shows last 20 moderation actions across all moderators
  - Real-time or polling-based updates (optional)
  
- [X] M026 [ADMIN] Add navigation for admin/moderator routes
  - Path: `components/features/navigation/AdminNav.tsx`
  - Sidebar or top nav for admin section
  - Links: Dashboard, Flags, Users, Reports, Settings
  - Only visible to users with moderator/admin role

**Checkpoint**: Admins have central dashboard for oversight

---

## Phase 6: Reporting & Analytics

**Purpose**: Insights into platform health and moderation effectiveness

- [ ] M027 [P] [REPORTS] Create incident trends report RPC
  - Path: `supabase/migrations/0010_reports.sql`
  - Function: `fn_get_incident_trends(game_slug text, period text)`
  - Returns incidents per day/week with category breakdown
  
- [ ] M028 [P] [REPORTS] Create moderation performance report RPC
  - Path: `supabase/migrations/0010_reports.sql`
  - Function: `fn_get_moderator_stats(moderator_id uuid, start_date date, end_date date)`
  - Returns: flags reviewed, incidents removed, average resolution time
  
- [ ] M029 [P] [REPORTS] Build reports page
  - Path: `app/(admin)/reports/page.tsx`
  - Dropdown to select report type: Incident Trends, Moderator Performance, User Growth
  - Date range picker
  - Export to CSV button (optional)
  
- [ ] M030 [REPORTS] Create category distribution chart
  - Path: `components/features/admin/CategoryDistributionChart.tsx`
  - Pie or bar chart showing incident category breakdown
  - Useful for identifying trends (e.g., spike in "Betrayal" reports)

**Checkpoint**: Admins can analyze platform metrics

---

## Phase 7: Settings & Configuration

**Purpose**: Admins can manage platform configuration

- [ ] M031 [P] [ADMIN] Create settings table for platform config
  - Path: `supabase/migrations/0011_settings.sql`
  - Table: `platform_settings` with columns: `key` (text pk), `value` (jsonb), `updated_by` (uuid), `updated_at` (timestamptz)
  - Seed initial settings: incident_rate_limit, daily_incident_cap, flag_auto_threshold
  
- [ ] M032 [P] [ADMIN] Build settings management API
  - Path: `app/(app)/api/admin/settings/route.ts`
  - GET: Fetch all settings (admin only)
  - PATCH: Update specific setting (admin only)
  - Validation for setting types (e.g., rate limits must be positive integers)
  
- [ ] M033 [P] [ADMIN] Create settings management page
  - Path: `app/(admin)/settings/page.tsx`
  - Form to edit platform settings
  - Settings categories: Moderation, Rate Limiting, Features
  - Save button with confirmation
  
- [ ] M034 [ADMIN] Add category management interface
  - Path: `app/(admin)/settings/categories/page.tsx`
  - List all incident_categories
  - Add/edit/disable categories (don't delete to preserve historical data)
  - Update category weights for reputation calculation

**Checkpoint**: Admins can configure platform behavior

---

## Phase 8: Audit & Compliance

**Purpose**: Track all admin actions for compliance and debugging

- [X] M035 [P] [ADMIN] Create audit log viewer
  - Path: `app/(admin)/audit/page.tsx`
  - Shows all moderation_logs with filters: action type, moderator, date range
  - Pagination with cursor-based loading
  - Export functionality for compliance
  
- [X] M036 [P] [ADMIN] Add detailed audit trail to moderation actions
  - Path: Update existing moderation endpoints
  - Include IP address, user agent, before/after state in logs
  - GDPR consideration: add data retention policy (auto-delete logs after 90 days)
  
- [X] M037 [ADMIN] Create data export endpoint (GDPR compliance)
  - Path: `app/(app)/api/user/export/route.ts`
  - User can request export of all their data (incidents, flags, profile)
  - Returns JSON file for download
  - Rate limited to prevent abuse

**Checkpoint**: Full audit trail for compliance

---

## Phase 9: Polish & Testing

**Purpose**: Ensure moderator tools are production-ready

- [ ] M038 [P] Unit tests for role checking functions
  - Path: `tests/unit/auth/roles.test.ts`
  - Test `requireModerator()`, `requireAdmin()`, `fn_user_has_role()`
  
- [ ] M039 [P] E2E test: Moderator reviews and dismisses flag
  - Path: `tests/e2e/moderator-flag-review.spec.ts`
  - Sign in as moderator → visit flag queue → dismiss flag → verify status updated
  
- [ ] M040 [P] E2E test: Moderator removes incident
  - Path: `tests/e2e/moderator-incident-removal.spec.ts`
  - Sign in as moderator → find incident → remove with reason → verify hidden from public view
  
- [ ] M041 [P] E2E test: Admin assigns moderator role
  - Path: `tests/e2e/admin-role-assignment.spec.ts`
  - Sign in as admin → search user → assign moderator role → verify user can access moderator routes
  
- [ ] M042 [P] Performance test: Flag queue with 1000+ flags
  - Path: `tests/performance/flag-queue.test.ts`
  - Seed 1000 flags → measure query time → should be < 300ms
  
- [ ] M043 Documentation: Moderator handbook
  - Path: `docs/moderator-handbook.md`
  - Guidelines for flag review, incident removal criteria, best practices
  
- [ ] M044 [P] Security audit of RLS policies
  - Path: Manual review + automated testing
  - Verify moderators can't escalate to admin
  - Verify users can't access admin APIs
  - Test with different role combinations

**Checkpoint**: Moderator system tested and documented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Auth)**: Must complete before any other phase - BLOCKS all moderation features
- **Phase 2 (Flags)**: Depends on Phase 1
- **Phase 3 (Incidents)**: Depends on Phase 1
- **Phase 4 (Users)**: Depends on Phase 1
- **Phase 5 (Dashboard)**: Depends on Phases 2, 3, 4 (needs data from all systems)
- **Phase 6 (Reports)**: Depends on Phases 2, 3 (needs moderation data)
- **Phase 7 (Settings)**: Can run in parallel with Phases 2-6 after Phase 1
- **Phase 8 (Audit)**: Depends on Phases 2-4 (logs all moderation actions)
- **Phase 9 (Polish)**: Depends on all previous phases

### Parallel Opportunities

- Within Phase 1: M003, M004, M005 can run in parallel after M001-M002
- Within Phase 2: M008, M009, M010 can run in parallel after M006-M007
- Within Phase 3: M013, M014, M016 can run in parallel after M011-M012
- Within Phase 4: M018, M019, M021 can run in parallel after M017
- Within Phase 5: M023, M024, M025, M026 can run in parallel after M022
- Phase 6 all tasks can run in parallel
- Phase 7 all tasks can run in parallel (after Phase 1)
- Phase 9 all tests can run in parallel

### Critical Path

1. M001-M002 (roles foundation)
2. M003-M005 (RLS + guards)
3. M006-M007 (flags schema + RPC)
4. M011-M012 (incidents moderation)
5. M022 (dashboard stats)
6. M023 (dashboard page)
7. Testing phase

---

## Notes

- **Priority**: Start with Phase 1 (auth), then Phase 2 (flags) for immediate moderator value
- **Staffing**: One developer can complete linearly; multiple developers can parallelize phases 2-4
- **Testing**: Each phase should have basic manual testing before moving to next
- **Deployment**: Can deploy incrementally (e.g., Phase 1-2 first, then 3-4, etc.)
- **Rollback**: Each migration should be reversible for safe rollback
