# Implementation Plan: Player ID Linking System

## Tech Stack
- **Database**: PostgreSQL (Supabase) with RLS policies
- **Backend**: Next.js 14 App Router API routes
- **Frontend**: React Server Components + Client Components
- **Email**: Supabase Auth email templates (transactional)
- **UI Components**: shadcn/ui (existing components + new forms)

## Project Structure

```
app/
├── user/
│   └── [username]/
│       └── page.tsx          # User profile page (NEW)
├── (app)/
│   └── api/
│       ├── user/
│       │   ├── link-player/
│       │   │   └── route.ts  # Link player ID (NEW)
│       │   ├── unlink-player/
│       │   │   └── route.ts  # Unlink player (NEW)
│       │   └── [username]/
│       │       └── route.ts  # Get user data (NEW)
│       └── notifications/
│           └── toggle/
│               └── route.ts  # Toggle notifications (NEW)
components/
├── features/
│   ├── user/
│   │   ├── LinkedPlayerCard.tsx    # (NEW)
│   │   ├── LinkPlayerForm.tsx      # (NEW)
│   │   └── UserProfileHeader.tsx   # (NEW)
│   └── player/
│       └── VerifiedBadge.tsx       # (NEW)
supabase/
└── migrations/
    ├── 0011_player_links.sql            # Player linking tables (NEW)
    ├── 0012_notification_system.sql     # Email notifications (NEW)
    └── 0013_user_profile_updates.sql    # User profile enhancements (NEW)
```

## Libraries & Dependencies

### Existing
- `@supabase/supabase-js` - Database client
- `zod` - Schema validation
- `next` - App framework
- `react` - UI library
- `tailwindcss` - Styling
- `shadcn/ui` - UI components

### New (if needed)
- None required - use existing stack

## Key Design Decisions

### Player Linking Model
- **One player ID per game per user**: Users can link different player names across games
- **First-claim wins**: Once a player ID is claimed, it's exclusive to that user
- **Admin override**: Admins can forcibly unlink for dispute resolution
- **No automated verification**: Manual claim system (future: API verification)

### Notification Strategy
- **Email-based**: Use Supabase auth email infrastructure
- **Opt-in by default**: Users automatically subscribed when linking player
- **Rate limiting**: Max 5 incident notifications per day per user
- **Aggregation**: Batch notifications if multiple incidents within 1 hour

### User vs Player Separation
- **User profiles** (`/user/[username]`): Account-level view, aggregate stats
- **Player profiles** (`/player/[playerId]`): Game-specific reputation, incidents
- **Verified badge**: Shows on player page if user has linked it
- **Unified display name**: Username from `user_profiles.display_name`

## Database Schema Overview

### New Table: `player_links`
```sql
CREATE TABLE player_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  player_id text NOT NULL,
  game_id uuid REFERENCES games(id),
  linked_at timestamptz DEFAULT now(),
  verified boolean DEFAULT false,
  UNIQUE(player_id, game_id)
);
```

### Updates to `user_profiles`
```sql
ALTER TABLE user_profiles
ADD COLUMN email_notifications boolean DEFAULT true,
ADD COLUMN last_notification_sent timestamptz,
ADD COLUMN notification_count_today int DEFAULT 0;
```

### New Table: `notification_queue`
```sql
CREATE TABLE notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(user_id),
  incident_id uuid REFERENCES incidents(id),
  sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz
);
```

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/user/link-player` | POST | Required | Link player ID to user account |
| `/api/user/unlink-player` | DELETE | Required | Remove player link |
| `/api/user/[username]` | GET | Optional | Get user profile (public + private if owner) |
| `/api/notifications/toggle` | POST | Required | Enable/disable email notifications |

## Pages

| Route | Type | Description |
|-------|------|-------------|
| `/user/[username]` | SSR | User profile page with linked players |
| `/player/[playerId]` | SSR | **Updated**: Add verified badge if linked |

## Security Considerations

1. **RLS Policies**: Users can only link/unlink their own players
2. **Admin Override**: Admins can manage any player links
3. **Rate Limiting**: Prevent link/unlink spam (max 10 operations per hour)
4. **Email Verification**: Only send notifications if user email is verified
5. **XSS Prevention**: Sanitize player IDs and display names
6. **CSRF Protection**: Next.js built-in protection for API routes

## Migration Dependencies

1. **0011_player_links.sql**: Create player_links table, RLS policies
2. **0012_notification_system.sql**: Notification queue, email trigger functions
3. **0013_user_profile_updates.sql**: Add notification preferences to user_profiles

## Testing Strategy

1. **Unit Tests**: Database functions (fn_link_player, fn_get_user_profile)
2. **Integration Tests**: API routes (link/unlink, notifications)
3. **E2E Tests**: User flow (signup → link player → receive notification)
4. **Security Tests**: RLS policy validation, admin override
