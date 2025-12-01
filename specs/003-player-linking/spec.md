# Feature Specification: Player ID Linking System

## Overview
Allow authenticated users to link in-game player IDs to their account profile. This creates a clear separation between users (accounts) and players (in-game identities), enabling users to claim their player profiles and receive notifications when they're reported.

## User Stories

### P1: Link Player IDs to User Account
**As a** registered user  
**I want to** link my in-game player names to my account  
**So that** I can claim ownership of player profiles and receive notifications

**Acceptance Criteria:**
- Users can add multiple player IDs (one per game)
- Player IDs must be unique per game (one user per player ID)
- Users can verify ownership through existing incident history
- Linked players show "Verified Player" badge on profile page
- Users can unlink player IDs from their account

### P2: Player Profile Ownership
**As a** user who has linked a player ID  
**I want to** see my verified badge on the player profile page  
**So that** others know this is my authentic profile

**Acceptance Criteria:**
- Player profile page shows "Verified by [username]" badge
- Badge links to user's profile page (new `/user/[username]` route)
- Only the linked user can claim a player ID
- Admin can override/remove player links

### P3: Incident Notifications
**As a** user with linked player IDs  
**I want to** receive notifications when someone reports me  
**So that** I can respond to incidents and defend my reputation

**Acceptance Criteria:**
- Email notification sent when linked player receives incident report
- Notification includes: reporter info, game, incident type, description
- User can opt-out of notifications in settings
- Rate limiting to prevent notification spam (max 5 per day)

### P4: User Profile Page
**As a** visitor  
**I want to** view a user's profile separate from player profiles  
**So that** I can see their account info, linked players, and activity

**Acceptance Criteria:**
- New route: `/user/[username]` displays user profile
- Shows: display name, join date, linked players, reputation aggregate
- Shows combined incident history across all linked players
- Private user settings (email, notifications) only visible to owner
- Admin view shows role, suspension status, management actions

## Technical Requirements

### Database Schema
- `player_links` table: Links users to player IDs
- Email notification preferences in `user_profiles`
- Audit logging for link/unlink actions

### API Endpoints
- `POST /api/user/link-player` - Link player ID to account
- `DELETE /api/user/unlink-player` - Remove player link
- `GET /api/user/[username]` - Get user profile data
- `POST /api/notifications/toggle` - Toggle notification preferences

### Security
- RLS policies: Users can only manage their own links
- Admin override capability for dispute resolution
- Rate limiting on link operations (prevent abuse)
- Email verification before notifications sent

## Out of Scope
- In-game API verification (manual claim only)
- Dispute resolution workflow (manual admin intervention)
- Player transfer between users
- Multiple users claiming same player (first-claim-only)
