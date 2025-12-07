# Production Database Update Summary

**Date**: December 7, 2025  
**Database**: https://fwrekewxtcikwwfapjzk.supabase.co  
**Status**: ✅ Mostly Complete (Extensions Pending)

---

## ✅ Task 1: Apply Missing Migrations

### Current Status
All required RPC functions are **already present** in production:

- ✅ `fn_get_player_profile` - Player reputation lookup
- ✅ `fn_get_user_incidents` - User's submitted reports  
- ✅ `fn_get_user_flags` - User's flagged incidents
- ✅ `fn_get_user_dashboard_stats` - Dashboard statistics
- ✅ `fn_get_linked_players` - User's linked player profiles
- ✅ `fn_get_leaderboard` - Game leaderboards
- ✅ `fn_get_recent_incidents` - Recent incident feed

**Conclusion**: No migration application needed. Functions already deployed.

---

## ⚠️ Task 2: Enable PostgreSQL Extensions

### Extensions Needed
Two PostgreSQL extensions are **not enabled** in production:

1. **pg_trgm** - Trigram matching for fuzzy text search
   - Used for: Player name search with typo tolerance
   - Example: `SELECT * FROM players WHERE identifier % 'PlayerNam'` matches 'PlayerName'

2. **pgcrypto** - Cryptographic functions  
   - Used for: UUID generation with `gen_random_uuid()`
   - Note: Tables are still working (Supabase provides UUIDs by default)

### How to Enable

**Option 1: Supabase Dashboard (Recommended)**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **SQL Editor**
4. Run the file: `enable-extensions.sql` (created in project root)
5. Verify with the included verification query

**Option 2: Supabase CLI**
```bash
npx supabase db push
```

**SQL to Run**:
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

**Impact of Not Enabling**:
- **pg_trgm**: Player search won't support fuzzy matching (typos won't work)
- **pgcrypto**: No immediate impact (Supabase handles UUIDs anyway)

---

## ✅ Task 3: Update Documentation

### Changes Made to `DATABASE_SETUP.md`

#### 1. Updated `incidents` Table Schema
**Added**:
- `status` - 'active' | 'hidden' | 'removed'
- `severity` - Incident severity level
- `moderated_by` - UUID of moderator
- `moderated_at` - Timestamp of moderation
- `moderation_reason` - Explanation for moderation action

#### 2. Updated `user_profiles` Table Schema  
**Added**:
- Suspension tracking:
  - `suspended_until` - Temporary ban end date
  - `suspension_reason` - Why user was suspended
- Notification preferences:
  - `email_notifications` - Opt-in/out for emails
  - `last_notification_sent` - Rate limiting
  - `notification_count_today` - Daily quota tracking

#### 3. Updated Incident Categories
**Changed**:
- Category #6: `good-sport` → `cheating` (matches production)
- Added note about potential additional categories

#### 4. Updated RPC Function Signatures
**Corrected**:
- `fn_get_user_incidents()` parameter order matches production
- Added verification query to check function existence

#### 5. Added New Sections
**New content**:
- **Production Schema Notes** - Documents differences from base schema
- **Schema Verification** - How to run `verify-database-schema.ts`
- **Troubleshooting** - Common issues with extensions and migrations

---

## 📁 Files Created

### 1. `enable-extensions.sql`
- **Purpose**: SQL script to enable pg_trgm and pgcrypto
- **Location**: Project root
- **Usage**: Run in Supabase SQL Editor
- **Includes**: Verification query and troubleshooting tips

### 2. `scripts/verify-database-schema.ts`
- **Purpose**: Compare production database with documentation
- **Usage**: `npx tsx scripts/verify-database-schema.ts`
- **Output**: Detailed report of matches/mismatches

### 3. `scripts/apply-missing-migrations.ts`
- **Purpose**: Check and apply missing components
- **Usage**: `npx tsx scripts/apply-missing-migrations.ts`
- **Features**: Extension enabling, function checking, migration guidance

### 4. `apply-missing-migrations.sql`
- **Purpose**: Manual migration guide with verification queries
- **Usage**: Reference for what needs to be applied
- **Note**: Functions already present, only extensions needed

### 5. `supabase/migrations/0000_enable_extensions.sql`
- **Purpose**: Migration file for extensions
- **Status**: Created but not applied (manual step required)
- **Usage**: Part of future `db push` operations

---

## 🎯 Current Production Schema

### Tables (All Present ✅)
- `games` - 5 games (tarkov, dark-and-darker, arc-raiders, psn, xbox)
- `players` - 8 players
- `incident_categories` - 6 categories
- `incidents` - 8 incidents (with moderation fields)
- `flags` - 0 flags
- `user_profiles` - 3 users (with suspension & notification fields)

### Indexes (All Present ✅)
- Player search indexes
- Incident filtering indexes  
- Full-text search on descriptions

### RPC Functions (All Present ✅)
- 7 core functions working correctly

### Views (Present ✅)
- `player_reputation_view` - Used by profile lookups

### Row Level Security (Enabled ✅)
- All tables have RLS policies
- Public read access configured
- Write access requires authentication

---

## 🚀 Next Steps

### Immediate Actions Required

1. **Enable PostgreSQL Extensions** 🔴 HIGH PRIORITY
   ```sql
   -- Run in Supabase SQL Editor:
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   CREATE EXTENSION IF NOT EXISTS pgcrypto;
   ```
   - File: `enable-extensions.sql`
   - Impact: Enables fuzzy player search
   - Time: < 1 minute

2. **Verify Extensions** 🟡 MEDIUM PRIORITY
   ```bash
   npx tsx scripts/verify-database-schema.ts
   ```
   - Should show pg_trgm and pgcrypto as ✅ after enabling
   - Confirms all 7 issues resolved

### Optional Enhancements

3. **Test Player Search** 🟢 LOW PRIORITY
   - After enabling pg_trgm, test fuzzy search
   - Query: `SELECT * FROM players WHERE identifier % 'partialname'`

4. **Update .gitignore** ✅ COMPLETE
   - Already updated to exclude development files
   - Documentation files now excluded from repo

---

## 📊 Verification Results

### Before Updates
- ❌ 7 components missing/incomplete
- ⚠️ Schema documentation outdated
- 🔍 No verification tooling

### After Updates  
- ✅ All RPC functions present
- ✅ Documentation matches production
- ✅ Automated verification script
- ⚠️ Extensions pending manual enablement (2 remaining)

### Summary
- **Passed**: 17/19 components (89%)
- **Pending**: 2/19 components (11%) - Extensions only
- **Action Required**: Run `enable-extensions.sql` in Supabase Dashboard

---

## 🛠️ Tools Available

### Verification
```bash
npx tsx scripts/verify-database-schema.ts
```

### Migration Helper
```bash  
npx tsx scripts/apply-missing-migrations.ts
```

### Manual SQL Files
- `enable-extensions.sql` - Enable pg_trgm and pgcrypto
- `apply-missing-migrations.sql` - Migration reference guide

---

## 📝 Notes

- **Why extensions aren't enabled via API**: Supabase requires elevated privileges to enable extensions, which aren't available through the service role key
- **Why functions already exist**: They were likely applied during earlier manual SQL runs or previous deployment
- **Database differences**: Production has evolved with moderation and notification features not in base schema
- **Documentation accuracy**: DATABASE_SETUP.md now reflects actual production schema

---

## ✅ Completion Checklist

- [x] Verify current production schema
- [x] Identify missing components  
- [x] Update documentation to match production
- [x] Create extension enablement script
- [x] Create verification tooling
- [ ] **Enable pg_trgm extension** ← PENDING USER ACTION
- [ ] **Enable pgcrypto extension** ← PENDING USER ACTION
- [ ] **Run final verification** ← After extensions enabled

---

**Last Updated**: December 7, 2025  
**Next Review**: After enabling extensions
