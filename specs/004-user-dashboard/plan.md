# Implementation Plan: User Dashboard

## Feature Name
User Dashboard System

## Tech Stack
- **Frontend**: Next.js 14 App Router, React Server Components, TypeScript
- **UI**: shadcn/ui (Card, Badge, Button, Tabs, Dialog, Switch)
- **Backend**: Supabase PostgreSQL, Row Level Security (RLS)
- **Auth**: Supabase Auth with role-based guards
- **Styling**: Tailwind CSS with existing dark theme

## Architecture

### Route Structure
```
app/
├── dashboard/
│   ├── page.tsx                    # Main dashboard overview
│   ├── layout.tsx                  # Dashboard layout with sidebar
│   └── loading.tsx                 # Loading state
├── (app)/api/
│   ├── user/
│   │   ├── incidents/route.ts      # Get user's submitted incidents
│   │   └── flags/route.ts          # Get user's submitted flags
```

### Component Structure
```
components/
├── features/
│   └── dashboard/
│       ├── DashboardLayout.tsx           # Sidebar + main content area
│       ├── DashboardOverview.tsx         # Stats cards + quick actions
│       ├── LinkedPlayersSection.tsx      # Manage linked players (reuse from 003)
│       ├── MyIncidentsSection.tsx        # User's incident submissions
│       ├── MyFlagsSection.tsx           # User's flag submissions
│       ├── ReportsAgainstMeSection.tsx  # Incidents on linked players
│       ├── AccountSettingsSection.tsx   # User preferences
│       ├── IncidentCard.tsx             # Reusable incident display
│       └── FlagCard.tsx                 # Reusable flag display
```

### Database Schema

**New Functions:**
```sql
-- Get incidents submitted by user (with filters)
fn_get_user_incidents(
  user_id uuid,
  status_filter text,  -- 'all', 'active', 'removed', 'flagged'
  limit_count int,
  offset_count int
)

-- Get flags submitted by user (with filters)
fn_get_user_flags(
  user_id uuid,
  resolution_filter text,  -- 'all', 'open', 'approved', 'dismissed'
  limit_count int,
  offset_count int
)

-- Get dashboard stats for user
fn_get_user_dashboard_stats(
  user_id uuid
) RETURNS {
  linked_players_count int,
  incidents_submitted_count int,
  flags_submitted_count int,
  reports_against_me_count int,
  total_reputation int
}
```

**No new tables needed** - uses existing:
- `player_links` (from 003-player-linking)
- `incidents` (existing)
- `flags` (from 002-moderation)
- `user_profiles` (existing)

## Implementation Phases

### Phase 1: Database Functions
1. Create migration `0014_user_dashboard_functions.sql`
2. Implement `fn_get_user_incidents` with status filtering
3. Implement `fn_get_user_flags` with resolution filtering
4. Implement `fn_get_user_dashboard_stats` for overview

### Phase 2: API Endpoints
1. Create `GET /api/user/incidents` - fetch user's incidents with filters
2. Create `GET /api/user/flags` - fetch user's flags with filters
3. Reuse existing `/api/user/[username]` for profile data
4. Reuse existing `/api/user/link-player` endpoints

### Phase 3: Dashboard Layout & Navigation
1. Create `DashboardLayout` component with sidebar navigation
2. Update `Header.tsx` to add "Dashboard" link for logged-in users
3. Create `dashboard/page.tsx` with overview
4. Add loading and error states

### Phase 4: Dashboard Sections
1. Create `DashboardOverview` - stats cards and quick actions
2. Create `MyIncidentsSection` - filterable incident list
3. Create `MyFlagsSection` - filterable flag list
4. Create `ReportsAgainstMeSection` - incidents on linked players
5. Reuse `LinkedPlayersSection` from feature 003

### Phase 5: Account Settings
1. Create `AccountSettingsSection` - notification toggle, display name
2. Integrate existing GDPR export endpoint
3. Add privacy settings for incident visibility

### Phase 6: Polish
1. Mobile responsive design
2. Pagination for all lists
3. Empty states for new users
4. Loading skeletons
5. Toast notifications for actions

## Key Libraries
- `@supabase/ssr` - Server-side Supabase client
- `zod` - Request validation
- `date-fns` - Date formatting
- `lucide-react` - Icons

## Security Considerations
- All dashboard routes protected by `requireAuth()` guard
- RLS policies ensure users only see their own data
- API endpoints validate user ownership
- Rate limiting on link/unlink operations (existing)
- Admin override capabilities (existing from 003)

## Performance Considerations
- Server-side data fetching with streaming
- Pagination for large lists (20 items per page)
- Database indexes on `incidents.reporter_user_id` and `flags.user_id`
- Cache user stats (5-minute TTL)

## Testing Strategy
- Unit tests: Database functions return correct filtered data
- Integration tests: API endpoints return user-scoped data only
- E2E tests: User can navigate dashboard, view incidents, manage players
- Security tests: User A can't access User B's data

## Deployment Notes
1. Run migration 0014
2. Deploy API endpoints
3. Deploy dashboard components and pages
4. Update header navigation
5. Verify RLS policies with different user roles

## Dependencies
- ✅ Feature 003 (Player Linking) - Complete
- ✅ Feature 002 (Moderation) - Complete (flags, status)
- ✅ Existing incidents table and API
- ✅ Existing auth guards and role system

## Success Metrics
- Users can access dashboard without errors
- All sections load data correctly
- Users can link/unlink players from dashboard
- Users can view their incident and flag history
- Settings update successfully
- Mobile responsive on all screen sizes
