# Feature Specification: User Dashboard

## Overview
Create a personalized dashboard for authenticated users to manage their account, linked player IDs, incident reports, and flagging activities. The dashboard serves as the central hub for user actions, separate from admin/moderator dashboards.

## User Stories

### P1: User Dashboard Homepage
**As a** logged-in user  
**I want to** access my personal dashboard  
**So that** I can see my activity overview and quick actions

**Acceptance Criteria:**
- Dashboard accessible at `/dashboard` route
- Shows: account overview, linked players count, incidents submitted count, flags submitted count
- Quick action cards: Link New Player, Submit Report, View My Reports, View My Flags
- Recent activity feed (last 10 actions)
- User can navigate to dashboard from header (when logged in)

### P2: Manage Linked Player IDs
**As a** logged-in user  
**I want to** view and manage my linked player IDs from dashboard  
**So that** I can easily claim/unclaim my player profiles

**Acceptance Criteria:**
- Dashboard section shows all linked players with game badges
- Each player card shows: game, player ID, incident count, link date
- One-click navigation to player profile page
- Unlink button with confirmation dialog
- "Link New Player" form integrated in dashboard
- Shows verification badge status for each linked player

### P3: My Incidents Section
**As a** logged-in user  
**I want to** see all incidents I've submitted  
**So that** I can track my reports and their moderation status

**Acceptance Criteria:**
- Tabbed view: "My Reports" shows incidents I submitted
- Filters: All, Pending, Removed, Active by status
- Sort by: Date (newest first), Game, Severity
- Each incident card shows: player, game, category, date, status badge
- Click to view full incident details
- Pagination (20 per page)
- Shows moderation status (if reviewed/removed)

### P4: My Flags Section
**As a** logged-in user  
**I want to** see all flags I've submitted on incidents  
**So that** I can track which reports I've challenged

**Acceptance Criteria:**
- Tabbed view: "My Flags" shows flags I submitted
- Shows: flagged incident, flag reason, submission date, resolution status
- Filter by resolution: Open, Approved, Dismissed
- Each flag card links to original incident
- Shows moderator resolution notes (if reviewed)
- Can't re-flag same incident
- Pagination (20 per page)

### P5: Incident Reports on My Linked Players
**As a** logged-in user with linked players  
**I want to** see incidents reported against my linked players  
**So that** I can monitor my reputation and respond if needed

**Acceptance Criteria:**
- Dashboard section: "Reports Against Me" shows incidents on linked players
- Grouped by player ID
- Shows: game, category, severity, date, reporter (if public), description
- Total incident count across all linked players
- Aggregated reputation score
- Can flag incidents as incorrect/fraudulent
- Shows which incidents triggered email notifications

### P6: Account Settings
**As a** logged-in user  
**I want to** manage my account preferences from dashboard  
**So that** I can control notifications and privacy settings

**Acceptance Criteria:**
- Settings section in dashboard
- Toggle: Email notifications for linked player incidents
- Display name editor (public username)
- Privacy setting: Make incident submissions public/private
- View joined date and account stats
- Link to export my data (GDPR compliance - existing endpoint)

## Technical Requirements

### Routes
- `GET /dashboard` - Main user dashboard page (protected)
- Reuse existing API endpoints from player linking (003-player-linking)
- Reuse existing incidents API for filtering by user

### Components
- `DashboardLayout` - Sidebar navigation for dashboard sections
- `DashboardOverview` - Stats cards and quick actions
- `LinkedPlayersSection` - Manage player links
- `MyIncidentsSection` - User's submitted incidents
- `MyFlagsSection` - User's submitted flags
- `ReportsAgainstMeSection` - Incidents on linked players
- `AccountSettingsSection` - User preferences

### Database Queries
- Reuse `fn_get_linked_players` from migration 0011
- Create `fn_get_user_incidents(user_id uuid, status_filter text)` - Get incidents submitted by user
- Create `fn_get_user_flags(user_id uuid, resolution_filter text)` - Get flags submitted by user
- Use existing `fn_get_linked_players` with incident count for "Reports Against Me"

### Navigation Updates
- Add "Dashboard" link to header (for logged-in users)
- Show after Browse/Games, before admin/moderator links
- Icon: User icon or dashboard icon
- Mobile menu: Show in user section

## User Flow
1. User logs in → Header shows "Dashboard" link
2. Click "Dashboard" → Navigate to `/dashboard`
3. See overview with stats and quick actions
4. Tabs/sections: Overview | Linked Players | My Reports | My Flags | Reports Against Me | Settings
5. Manage players, view reports, flag incidents, adjust settings

## Design Notes
- Consistent with existing admin dashboard styling (dark theme, cards, badges)
- Use existing shadcn/ui components (Card, Badge, Button, Tabs)
- Color coding: Green (active), Yellow (pending), Red (removed), Blue (flagged)
- Mobile responsive with collapsible sidebar

## Security
- All dashboard routes protected by `requireAuth()` guard
- Users can only see their own data (RLS policies)
- Admin users see additional admin actions in user dashboard
- Rate limiting on bulk operations

## Dependencies
- Feature 003 (Player Linking) must be complete
- Existing incidents and flags tables
- Existing moderation system (for status badges)

## Out of Scope
- Real-time notifications (email only for now)
- Direct messaging between users
- Dispute resolution workflow (admin handles manually)
- Social features (followers, comments)
- Advanced analytics/charts (just counts for MVP)
