# PlayStation and Xbox Gamertag Support

**Date:** December 2, 2025  
**Feature:** Cross-Platform Incident Reporting

## Overview

Added support for PlayStation Network (PSN) and Xbox Live gamertags, allowing users to:
- Link their PSN IDs and Xbox Gamertags
- Report incidents for console players
- Check reputation across platforms
- Track console player behavior

## Changes Made

### 1. Database Updates

**Migration:** `0017_add_platform_games.sql`
- Added 'psn' (PlayStation Network) as a supported platform
- Added 'xbox' (Xbox Live) as a supported platform

**Seed Data:** `supabase/seed/seed.sql`
- PSN and Xbox now included in default games list

### 2. Validation Logic

**File:** `lib/validation/player-id.ts`

Added comprehensive validation for platform-specific identifiers:

#### PSN ID Validation
- **Length:** 3-16 characters
- **Allowed:** Letters, numbers, hyphens, underscores
- **Rules:** Cannot start or end with hyphen or underscore
- **Examples:**
  - ✅ `PlayerName123`
  - ✅ `Player_Name-123`
  - ❌ `-PlayerName` (starts with hyphen)
  - ❌ `ab` (too short)

#### Xbox Gamertag Validation
- **Length:** 1-15 characters (20 with suffix)
- **Allowed:** Letters, numbers, spaces
- **Rules:** Cannot start or end with space
- **New Format:** Supports discriminator suffix (#1234)
- **Examples:**
  - ✅ `PlayerName123`
  - ✅ `Player Name`
  - ✅ `PlayerName#1234` (new format)
  - ❌ ` PlayerName` (starts with space)
  - ❌ `Player-Name` (hyphen not allowed)

### 3. Helper Functions

Added platform-specific helper functions:

**`validatePSNID(identifier: string)`**
- Validates PSN ID format
- Returns boolean

**`validateXboxGamertag(identifier: string)`**
- Validates Xbox Gamertag format
- Supports both classic and modern formats
- Returns boolean

**`getPlayerIdPlaceholder(gameSlug: string)`**
- Returns: `'PSN_Username'` for PSN
- Returns: `'GamerTag or GamerTag#1234'` for Xbox

**`getPlayerIdLabel(gameSlug: string)`**
- Returns: `'PSN ID'` for PSN
- Returns: `'Xbox Gamertag'` for Xbox

**`getPlayerIdError(gameSlug: string)`**
- Returns platform-specific error messages

### 4. Test Coverage

**File:** `tests/unit/platform-identifiers.test.ts`

Created comprehensive test suite with 16 tests:
- ✅ PSN ID validation (valid and invalid cases)
- ✅ Xbox Gamertag validation (valid and invalid cases)
- ✅ Platform-specific identifier validation
- ✅ Placeholder text generation
- ✅ Label text generation
- ✅ Error message generation

**Test Results:** 16/16 passing ✅

## Usage Examples

### Linking a PSN Account

```typescript
// In the user dashboard
const psnId = 'PlayerName123';
const gameSlug = 'psn';

if (validatePlayerIdentifier(psnId, gameSlug)) {
  // Link the PSN account
  await linkPlayer(psnId, gameId);
}
```

### Reporting an Incident (Xbox)

```typescript
// In the report form
const xboxGamertag = 'Player Name#1234';
const gameSlug = 'xbox';

if (validatePlayerIdentifier(xboxGamertag, gameSlug)) {
  // Submit incident report
  await createIncident({
    game_id: gameId,
    identifier: xboxGamertag,
    // ... other fields
  });
}
```

### Form Validation

```tsx
// In a React component
const placeholder = getPlayerIdPlaceholder('psn'); // 'PSN_Username'
const label = getPlayerIdLabel('psn'); // 'PSN ID'
const error = getPlayerIdError('psn'); // 'Invalid PSN ID...'

<Input
  label={label}
  placeholder={placeholder}
  error={isInvalid ? error : undefined}
/>
```

## Database Schema

The existing `games` and `players` tables support these new platforms:

```sql
-- Games table includes PSN and Xbox
INSERT INTO public.games (slug, name) VALUES
  ('psn', 'PlayStation Network'),
  ('xbox', 'Xbox Live');

-- Players table links users to their platform identifiers
-- Example: A user can link multiple platform accounts
CREATE TABLE public.players (
  id uuid PRIMARY KEY,
  game_id uuid REFERENCES games(id),
  identifier text NOT NULL,  -- PSN ID or Xbox Gamertag
  display_name text,
  UNIQUE (game_id, identifier)
);
```

## Migration Instructions

### 1. Apply Database Migration

```bash
# Using Supabase CLI
npx supabase db push

# Or in Supabase SQL Editor
-- Run: supabase/migrations/0017_add_platform_games.sql
```

### 2. Verify Games Added

```sql
SELECT * FROM public.games WHERE slug IN ('psn', 'xbox');
```

Expected output:
```
slug | name
-----|---------------------
psn  | PlayStation Network
xbox | Xbox Live
```

### 3. Test Validation

```bash
npm test -- platform-identifiers
```

Should show: 16/16 tests passing

## API Integration

The existing API endpoints automatically support PSN and Xbox:

**POST /api/incidents**
- Accepts `game_id` for PSN or Xbox
- Validates `identifier` using platform-specific rules

**POST /api/user/link-player**
- Allows linking PSN IDs and Xbox Gamertags
- Enforces platform-specific validation

**GET /api/player/:game/:identifier**
- Works with PSN IDs and Xbox Gamertags
- Returns cross-platform reputation

## User-Facing Changes

### Dashboard
- Users can now link their PSN and Xbox accounts
- View incidents across all linked platforms

### Browse Page
- Filter by PSN or Xbox platform
- See platform-specific player profiles

### Report Form
- Select PSN or Xbox as the game
- Appropriate placeholder and validation messages
- Platform-specific ID format requirements

## Validation Rules Summary

| Platform | Min Length | Max Length | Allowed Characters | Special Rules |
|----------|------------|------------|-------------------|---------------|
| PSN      | 3          | 16         | A-Z, 0-9, -, _    | Cannot start/end with - or _ |
| Xbox     | 1          | 15 (+5 suffix) | A-Z, 0-9, space | Cannot start/end with space, optional #1234 suffix |

## Future Enhancements

Potential additions:
- Steam ID support
- Epic Games ID support
- Nintendo Network ID support
- Battle.net ID support
- Platform-specific profile icons
- Cross-platform player matching
- Platform verification system

## Testing Checklist

- [x] PSN ID validation works correctly
- [x] Xbox Gamertag validation works correctly
- [x] Database migration created
- [x] Seed data updated
- [x] Unit tests pass (16/16)
- [x] Helper functions return correct values
- [ ] Apply migration to production database
- [ ] Test incident reporting with PSN ID
- [ ] Test incident reporting with Xbox Gamertag
- [ ] Test player linking with both platforms
- [ ] Verify UI displays correct placeholders/labels

## Notes

- PSN IDs and Xbox Gamertags are stored in the same `players` table
- Platform is distinguished by the `game_id` foreign key
- Validation happens both client-side and server-side
- Existing API endpoints work without modification
- User profiles can link multiple platform accounts

---

**Total Files Changed:** 4  
**Lines of Code Added:** ~150  
**Test Coverage:** 16 new tests, all passing ✅
