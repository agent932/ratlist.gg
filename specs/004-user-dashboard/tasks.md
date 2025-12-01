# Tasks: User Dashboard

**Feature**: User Dashboard for account management, player linking, and activity tracking  
**Input**: Plan and spec documents from `/specs/004-user-dashboard/`  
**Prerequisites**: Feature 003 (Player Linking) complete, Feature 002 (Moderation) complete

**Organization**: Tasks are grouped by user story to enable independent implementation

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Parallelizable (can be done independently)
- **Story labels**: [US1], [US2], [US3], [US4], [US5], [US6] (maps to user stories in spec.md)

---

## Phase 1: Setup & Infrastructure

**Purpose**: Database functions and indexes for dashboard data

- [ ] T001 Create database migration for dashboard functions
  - Path: `supabase/migrations/0014_user_dashboard_functions.sql`
  - Function: `fn_get_user_incidents(user_id, status_filter, lim, off)` with RLS
  - Function: `fn_get_user_flags(user_id, resolution_filter, lim, off)` with RLS
  - Function: `fn_get_user_dashboard_stats(user_id)` returns JSON stats
  - Indexes: `incidents(reporter_user_id)`, `flags(user_id)` if not exist
  - Comments on all functions

**Checkpoint**: Database ready for dashboard queries

---

## Phase 2: Foundational Components (Blocking Prerequisites)

**Purpose**: Shared components needed by multiple dashboard sections

- [ ] T002 [P] Create reusable IncidentCard component
  - Path: `components/features/dashboard/IncidentCard.tsx`
  - Props: incident data, show status badge, show moderation info
  - Displays: game badge, player ID, category, date, status, description preview
  - Links to incident detail page (if exists)
  - Responsive card layout
  
- [ ] T003 [P] Create reusable FlagCard component
  - Path: `components/features/dashboard/FlagCard.tsx`
  - Props: flag data, show resolution status
  - Displays: flagged incident info, reason, submission date, resolution badge
  - Links to original incident
  - Shows moderator notes if reviewed

**Checkpoint**: Shared components ready for use in sections

---

## Phase 3: User Story 1 - Dashboard Homepage

**Goal**: User can access dashboard and see activity overview  
**Tests**: User navigates to /dashboard, sees stats cards, recent activity

- [ ] T004 [P] [US1] Create dashboard API endpoint for stats
  - Path: `app/(app)/api/dashboard/stats/route.ts`
  - GET: Calls `fn_get_user_dashboard_stats` for current user
  - Returns: linked_players_count, incidents_submitted, flags_submitted, reports_against_me, reputation
  - Auth guard: `requireAuth()`
  
- [ ] T005 [P] [US1] Create DashboardOverview component
  - Path: `components/features/dashboard/DashboardOverview.tsx`
  - Stat cards: Linked Players, Reports Submitted, Flags Submitted, Reports Against Me
  - Quick action buttons: Link Player, Submit Report, View Profile
  - Recent activity feed (last 5 actions)
  - Loading skeleton state
  
- [ ] T006 [P] [US1] Create DashboardLayout component
  - Path: `components/features/dashboard/DashboardLayout.tsx`
  - Sidebar navigation: Overview, Linked Players, My Reports, My Flags, Reports Against Me, Settings
  - Mobile: Collapsible menu
  - Active link highlighting
  - Responsive layout with main content area
  
- [ ] T007 [US1] Create dashboard page
  - Path: `app/dashboard/page.tsx`
  - Server component: Fetch stats via `fn_get_user_dashboard_stats`
  - Auth guard: `requireAuth()` redirect to /auth/sign-in
  - Renders DashboardLayout + DashboardOverview
  - Metadata: title, description
  
- [ ] T008 [US1] Update Header component with Dashboard link
  - Path: `components/layout/Header.tsx`
  - Add "Dashboard" link after Browse/Games (for logged-in users only)
  - Show before moderator/admin links
  - Icon: LayoutDashboard or User icon
  - Mobile menu: Add in user section

**Checkpoint**: User can access /dashboard and see overview

---

## Phase 4: User Story 2 - Manage Linked Players

**Goal**: User can view and manage linked player IDs from dashboard  
**Tests**: User sees linked players, can unlink, can link new player

- [ ] T009 [P] [US2] Create LinkedPlayersSection component
  - Path: `components/features/dashboard/LinkedPlayersSection.tsx`
  - Fetches linked players via existing API `/api/user/[username]`
  - Displays LinkedPlayerCard for each (reuse from 003)
  - "Link New Player" button → opens LinkPlayerForm modal/section
  - Empty state: "No linked players yet"
  - Grid layout, responsive

**Checkpoint**: User can manage linked players from dashboard

---

## Phase 5: User Story 3 - My Incidents Section

**Goal**: User can see and filter incidents they've submitted  
**Tests**: User sees submitted incidents, filters work, pagination works

- [ ] T010 [P] [US3] Create API endpoint for user incidents
  - Path: `app/(app)/api/user/incidents/route.ts`
  - GET: Calls `fn_get_user_incidents(auth.uid(), status_filter, limit, offset)`
  - Query params: status (all/active/removed/flagged), page, limit (default 20)
  - Returns: incidents array, total_count, has_more
  - Auth guard: `requireAuth()`
  
- [ ] T011 [P] [US3] Create MyIncidentsSection component
  - Path: `components/features/dashboard/MyIncidentsSection.tsx`
  - Client component with filters: All, Active, Removed, Flagged
  - Fetches from `/api/user/incidents` with status filter
  - Maps data to IncidentCard components
  - Pagination controls (Next/Prev, page numbers)
  - Empty state: "You haven't submitted any reports"
  - Loading state

**Checkpoint**: User can view and filter their submitted incidents

---

## Phase 6: User Story 4 - My Flags Section

**Goal**: User can see and filter flags they've submitted  
**Tests**: User sees submitted flags, filters work, shows resolution status

- [ ] T012 [P] [US4] Create API endpoint for user flags
  - Path: `app/(app)/api/user/flags/route.ts`
  - GET: Calls `fn_get_user_flags(auth.uid(), resolution_filter, limit, offset)`
  - Query params: resolution (all/open/approved/dismissed), page, limit (default 20)
  - Returns: flags array with incident data, total_count, has_more
  - Auth guard: `requireAuth()`
  
- [ ] T013 [P] [US4] Create MyFlagsSection component
  - Path: `components/features/dashboard/MyFlagsSection.tsx`
  - Client component with filters: All, Open, Approved, Dismissed
  - Fetches from `/api/user/flags` with resolution filter
  - Maps data to FlagCard components
  - Shows resolution badge (green=approved, red=dismissed, yellow=open)
  - Pagination controls
  - Empty state: "You haven't flagged any reports"
  - Loading state

**Checkpoint**: User can view and filter their submitted flags

---

## Phase 7: User Story 5 - Reports Against Me Section

**Goal**: User can see incidents reported against their linked players  
**Tests**: User sees incidents on linked players, grouped by player, can flag

- [ ] T014 [P] [US5] Create ReportsAgainstMeSection component
  - Path: `components/features/dashboard/ReportsAgainstMeSection.tsx`
  - Fetches linked players with incidents via existing `/api/user/[username]`
  - Groups incidents by player_id
  - Displays player header + incident list per player
  - Shows total incident count and aggregated reputation
  - Each incident shows: category, severity, date, description, reporter (if public)
  - Button to flag incident as fraudulent (links to flag form)
  - Empty state: "No reports against your linked players"

**Checkpoint**: User can monitor incidents on their linked players

---

## Phase 8: User Story 6 - Account Settings

**Goal**: User can manage account preferences from dashboard  
**Tests**: User can toggle notifications, update display name, view account info

- [ ] T015 [P] [US6] Create AccountSettingsSection component
  - Path: `components/features/dashboard/AccountSettingsSection.tsx`
  - Client component with form
  - Display name input (updates user_profiles.display_name)
  - Email notifications toggle (uses existing `/api/notifications/toggle`)
  - Shows joined date (read-only)
  - Shows account stats: total incidents, total flags, reputation
  - "Export My Data" button (uses existing `/api/user/export`)
  - Save button with loading state
  - Toast notifications on success/error

**Checkpoint**: User can manage account settings

---

## Phase 9: Dashboard Routes Integration

**Purpose**: Wire up all sections into dashboard with tab navigation

- [ ] T016 Create dashboard layout file
  - Path: `app/dashboard/layout.tsx`
  - Wraps children with DashboardLayout component
  - Handles auth check and redirect
  
- [ ] T017 [P] Create dashboard sections as pages or tabs
  - Option A: Use shadcn Tabs component in single page
  - Option B: Nested routes `/dashboard/linked-players`, `/dashboard/incidents`, etc.
  - Recommended: Tabs component for better UX (no page reload)
  - Wire up: Overview (default), Linked Players, My Reports, My Flags, Reports Against Me, Settings
  
- [ ] T018 Add loading and error states
  - Path: `app/dashboard/loading.tsx` - skeleton UI
  - Path: `app/dashboard/error.tsx` - error boundary
  - Suspense boundaries for each section

**Checkpoint**: All dashboard sections accessible and functional

---

## Phase 10: Polish & Mobile Responsiveness

**Purpose**: Ensure dashboard works on all devices and has good UX

- [ ] T019 [P] Mobile responsive design for all components
  - DashboardLayout: Collapsible sidebar, hamburger menu
  - Stat cards: Stack vertically on mobile
  - Incident/flag cards: Full width on mobile
  - Pagination: Compact controls on small screens
  
- [ ] T020 [P] Add empty states for all sections
  - Custom illustrations or icons
  - Helpful messaging with call-to-action
  - Example: "Link your first player ID to start tracking your reputation"
  
- [ ] T021 [P] Add loading skeletons
  - Skeleton for stat cards while loading
  - Skeleton for incident/flag lists
  - Smooth transitions when data loads
  
- [ ] T022 [P] Add toast notifications for user actions
  - Success: "Player linked successfully"
  - Error: "Failed to link player. Try again."
  - Info: "Settings saved"

**Checkpoint**: Dashboard is polished and mobile-friendly

---

## Dependencies & Execution Order

### Critical Path (Must Complete in Order)
1. **Phase 1** (Database) → All other phases depend on DB functions
2. **Phase 2** (Components) → Phases 5 & 6 depend on IncidentCard/FlagCard
3. **Phase 3** (Dashboard Homepage) → Provides navigation to other sections
4. **Phases 4-8** can run in parallel (independent sections)
5. **Phase 9** (Integration) → Requires phases 3-8 complete
6. **Phase 10** (Polish) → Final touches after integration

### Parallel Opportunities
- After Phase 1 complete, run Phases 2-8 in parallel:
  - T002-T003 (Components)
  - T004-T008 (Dashboard Homepage)
  - T009 (Linked Players)
  - T010-T011 (My Incidents)
  - T012-T013 (My Flags)
  - T014 (Reports Against Me)
  - T015 (Account Settings)

### User Story Completion Order (for incremental delivery)
1. **US1** (Dashboard Homepage) - T004-T008 → Gives users entry point
2. **US2** (Linked Players) - T009 → Core feature (depends on 003)
3. **US3** (My Incidents) - T010-T011 → High value
4. **US4** (My Flags) - T012-T013 → High value
5. **US5** (Reports Against Me) - T014 → Unique value prop
6. **US6** (Account Settings) - T015 → Nice to have

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)
- Phase 1: Database functions
- Phase 3: Dashboard homepage with stats
- Phase 4: Linked players management
- Phase 9: Basic integration (tabs or routes)

### Post-MVP Enhancements
- Phase 5-8: All other sections
- Phase 10: Polish and mobile optimization

### Recommended Approach
1. Complete Phase 1 (database) first
2. Complete Phase 3 (dashboard homepage) for entry point
3. Implement user stories in priority order (US1 → US6)
4. Integrate and polish (Phase 9-10)

---

## Notes

- **Reuse from Feature 003**: `LinkedPlayerCard`, `LinkPlayerForm`, `/api/user/link-player` endpoints
- **Reuse from Feature 002**: Flag status badges, moderation status display
- **New Components**: Focus on dashboard-specific layouts and filtering
- **No new tables**: All data comes from existing schema
- **Testing**: Each phase should include basic E2E test for user flow
- **Performance**: Pagination prevents large data loads, indexes optimize queries

---

## Total Task Count: 22 tasks
- Phase 1 (Setup): 1 task
- Phase 2 (Components): 2 tasks  
- Phase 3 (US1): 5 tasks
- Phase 4 (US2): 1 task
- Phase 5 (US3): 2 tasks
- Phase 6 (US4): 2 tasks
- Phase 7 (US5): 1 task
- Phase 8 (US6): 1 task
- Phase 9 (Integration): 3 tasks
- Phase 10 (Polish): 4 tasks
