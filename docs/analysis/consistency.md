# Code Consistency Analysis - Next.js/TypeScript Codebase

**Analysis Date**: December 1, 2025  
**Codebase**: ratlist.gg (Next.js/TypeScript)  
**Files Analyzed**: 99 TypeScript/TSX files

---

## Executive Summary

This analysis identifies **23 consistency issues** across 8 categories. The most critical issues are:
1. **Import path mixing** (relative vs absolute paths)
2. **Duplicate `cn()` utility functions**
3. **Mixed `'use client'` quote styles**
4. **Inconsistent error handling patterns**

---

## 1. Import Path Consistency

### Pattern Found
The project uses TypeScript path aliases with `@/` prefix configured in `tsconfig.json`. However, there's **significant mixing** of absolute and relative imports.

### Inconsistencies

**HIGH SEVERITY**: Major mixing of import styles

**Files using RELATIVE paths** (should use `@/`):
```typescript
// app/(app)/api/incidents/route.ts - Lines 2-6
import { withErrorHandling, badRequest, unauthorized } from '../../../../lib/http'
import { createSupabaseServer, createSupabaseAdmin } from '../../../../lib/supabase/server'
import { IncidentInput } from '../../../../lib/validation/incident'
import { checkRateLimit, recordSubmission } from '../../../../lib/rate-limit'

// components/features/incident-form/IncidentForm.tsx - Lines 4-5
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'

// components/features/dashboard/MyIncidentsSection.tsx - Line 7
import { IncidentCard } from './IncidentCard'
```

**Files using ABSOLUTE paths** (`@/` prefix):
```typescript
// app/(app)/browse/page.tsx
import { createSupabaseServer } from '@/lib/supabase/server';
import { BrowseFilters } from '@/components/features/browse-filters/BrowseFilters';

// app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth/guards';
```

**Files affected**:
- `app/(app)/api/incidents/route.ts` 
- `components/features/incident-form/IncidentForm.tsx`
- `components/ui/input.tsx` (uses `../../lib/cn`)
- `components/ui/card.tsx` (uses `../../lib/cn`)

### Recommendation
**Convert ALL imports to use `@/` prefix**. This is Next.js best practice and improves:
- Code maintainability (no path depth calculation)
- Refactoring safety (paths don't break when moving files)
- Consistency and readability

### Files to Update
1. `app/(app)/api/incidents/route.ts` - 4 imports
2. `components/features/incident-form/IncidentForm.tsx` - 2 imports
3. `components/ui/input.tsx` - 1 import
4. `components/ui/card.tsx` - 1 import

**Severity**: HIGH

---

## 2. Naming Conventions

### Pattern Found
Generally **consistent** naming across the codebase:
- **Components**: PascalCase (✅ `IncidentForm.tsx`, `Header.tsx`)
- **Functions**: camelCase (✅ `requireAuth()`, `createSupabaseServer()`)
- **Interfaces**: PascalCase with `Props` suffix (✅ `BrowseFiltersProps`, `IncidentCardProps`)
- **Variables**: camelCase (✅ `selectedGame`, `supabase`)

### Inconsistencies

**LOW SEVERITY**: Minor deviations

1. **Props type definition style**:
   ```typescript
   // Most components use interface (PREFERRED)
   interface BrowseFiltersProps { ... }
   
   // Some use type alias (IncidentForm.tsx)
   type Props = { games: Game[], categories: Category[] }
   type Game = { id: string; slug: string; name: string }
   ```

2. **Constants naming**:
   ```typescript
   // lib/reputation.ts - CORRECT ✅
   export const DEFAULT_WEIGHTS: CategoryWeights = { ... }
   
   // components/features/incident-form/IncidentForm.tsx - CORRECT ✅
   const EMBARK_ID_GAMES = ['the-finals', 'arc-raiders'];
   
   // components/features/dashboard/IncidentCard.tsx - INCORRECT ❌
   const severityColors = { ... }  // Should be SEVERITY_COLORS
   const statusColors = { ... }     // Should be STATUS_COLORS
   
   // components/features/recent-incidents/RecentIncidentsList.tsx - INCORRECT ❌
   const categoryColors: Record<string, string> = { ... }  // Should be CATEGORY_COLORS
   
   // components/features/dashboard/FlagCard.tsx - INCORRECT ❌
   const resolutionColors = { ... }  // Should be RESOLUTION_COLORS
   ```

### Recommendation
1. **Standardize on `interface` for component props** (current majority pattern)
2. **Use UPPER_SNAKE_CASE for all constant objects** (color mappings, config objects)

### Files to Update
1. `components/features/incident-form/IncidentForm.tsx` - Change `type Props` to `interface IncidentFormProps`
2. `components/features/dashboard/IncidentCard.tsx` - Rename to `SEVERITY_COLORS`, `STATUS_COLORS`
3. `components/features/dashboard/FlagCard.tsx` - Rename to `RESOLUTION_COLORS`
4. `components/features/recent-incidents/RecentIncidentsList.tsx` - Rename to `CATEGORY_COLORS`

**Severity**: MEDIUM

---

## 3. Supabase Client Usage

### Pattern Found
**Consistent and correct** Supabase client creation patterns:

**Server Components/API Routes**:
```typescript
import { createSupabaseServer } from '@/lib/supabase/server';
const supabase = createSupabaseServer();
```

**Client Components**:
```typescript
import { createSupabaseBrowser } from '@/lib/supabase/client';
const supabase = createSupabaseBrowser();
```

**Admin Operations** (bypasses RLS):
```typescript
import { createSupabaseAdmin } from '@/lib/supabase/server';
const supabaseAdmin = createSupabaseAdmin();
```

### Inconsistencies

**NONE FOUND** - ✅ **EXCELLENT**

All Supabase client usage follows proper patterns:
- Server-side: `createSupabaseServer()` (23 uses)
- Client-side: `createSupabaseBrowser()` (1 use in Header.tsx)
- Admin: `createSupabaseAdmin()` (7 uses)

### Recommendation
**No changes needed**. This is a model implementation.

**Severity**: NONE

---

## 4. Auth Guard Patterns

### Pattern Found
**Consistent** auth guard usage across protected routes:

**Functions available**:
- `requireAuth()` - Returns user, throws on unauthorized
- `requireModerator()` - Throws if not moderator/admin
- `requireAdmin()` - Throws if not admin
- `getCurrentUserRole()` - Returns role without throwing
- `getCurrentUserWithRole()` - Returns user + role

### Inconsistencies

**MEDIUM SEVERITY**: Some routes lack auth checks

**Routes WITH auth guards** (✅):
```typescript
// API Routes
app/(app)/api/user/export/route.ts          → requireAuth()
app/(app)/api/admin/users/search/route.ts   → requireAdmin()
app/(app)/api/moderator/flags/[flagId]/route.ts → requireModerator()

// Pages
app/dashboard/page.tsx                       → requireAuth()
app/(admin)/audit/page.tsx                   → requireAdmin()
app/(moderator)/flags/page.tsx              → requireModerator()
```

**Routes with INCONSISTENT patterns** (⚠️):
```typescript
// app/(app)/api/incidents/route.ts - Line 94-95
// Uses manual check instead of requireAuth()
const supabase = createSupabaseServer()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return unauthorized('Sign in required')

// Should be:
const user = await requireAuth();
```

**Inconsistent error handling**:
```typescript
// Some routes catch and return responses
try {
  await requireAdmin();
} catch (error) {
  if (error instanceof Error && error.message === 'Admin access required') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
}

// Better pattern (let errors bubble):
export const PATCH = withErrorHandling(async (req: NextRequest) => {
  await requireAdmin(); // Throws, caught by withErrorHandling
  // ... rest of handler
});
```

### Recommendation
1. **Replace manual `supabase.auth.getUser()` checks with `requireAuth()`**
2. **Use consistent error handling** - let errors bubble to error boundary
3. **Wrap ALL API routes** with `withErrorHandling`

### Files to Update
1. `app/(app)/api/incidents/route.ts` - Replace manual auth check (line 94-95)
2. `app/(app)/api/admin/users/[userId]/role/route.ts` - Simplify error handling

**Severity**: MEDIUM

---

## 5. Component Structure Patterns

### Pattern Found
**Mostly consistent** client vs server component declarations:

**'use client' directive usage**:
- Interactive components: ✅ (forms, buttons with onClick, etc.)
- Server components: ✅ (pages, data fetching)

### Inconsistencies

**LOW SEVERITY**: Quote style inconsistency

**Single vs Double quotes in 'use client'**:
```typescript
// Single quotes (majority - 15+ files) ✅ PREFERRED
'use client'  // components/features/incident-form/IncidentForm.tsx
'use client'  // components/layout/Header.tsx
'use client'  // components/features/dashboard/DashboardOverview.tsx

// Double quotes (shadcn/ui components - 5 files) ❌ INCONSISTENT
"use client"  // components/ui/tabs.tsx
"use client"  // components/ui/switch.tsx
"use client"  // components/ui/label.tsx
"use client"  // components/ui/alert-dialog.tsx
"use client"  // components/ui/button.tsx
```

**Semicolon inconsistency**:
```typescript
'use client';  // WITH semicolon - some files
'use client'   // WITHOUT semicolon - other files
```

### Props Interface Naming

**CONSISTENT** - ✅ All follow `ComponentNameProps` pattern:
- `BrowseFiltersProps`
- `IncidentCardProps`
- `FlagCardProps`
- `DashboardLayoutProps`
- `LeaderboardTableProps`

### Export Patterns

**CONSISTENT** - ✅ All follow proper patterns:
- **Pages**: `export default async function PageName()`
- **Components**: Named exports `export function ComponentName()`
- **UI Components**: Named exports with types `export { Button, buttonVariants }`

### Recommendation
1. **Standardize on single quotes without semicolon**: `'use client'`
2. **Update shadcn/ui components** to match project style

### Files to Update
1. `components/ui/tabs.tsx` - Change to `'use client'`
2. `components/ui/switch.tsx` - Change to `'use client'`
3. `components/ui/label.tsx` - Change to `'use client'`
4. `components/ui/alert-dialog.tsx` - Change to `'use client'`
5. `components/ui/button.tsx` - Change to `'use client'`

**Severity**: LOW (cosmetic)

---

## 6. Error Handling

### Pattern Found
**Mixed** error handling approaches across API routes.

### Inconsistencies

**HIGH SEVERITY**: Inconsistent error handling patterns

**Pattern 1: Using `withErrorHandling` wrapper** (✅ PREFERRED):
```typescript
// app/(app)/api/incidents/route.ts
export const POST = withErrorHandling(async (req: NextRequest) => {
  // ... logic
  if (!user) return unauthorized('Sign in required')
  if (!parsed.success) return badRequest('Invalid input')
  return NextResponse.json({ id: incident.id }, { status: 201 })
})
```

**Pattern 2: Manual try/catch** (⚠️ INCONSISTENT):
```typescript
// app/(app)/api/admin/users/[userId]/role/route.ts
export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await requireAdmin();
    // ... logic
    return NextResponse.json({ success: true, data: { ... } });
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error in role assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Pattern 3: Mixed approaches** (❌ WORST):
```typescript
// app/(app)/api/incidents/route.ts - GET handler
try {
  // ... manual try/catch
  if (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json({ error: 'Failed to fetch incidents' }, { status: 500 });
  }
} catch (error) {
  console.error('Incidents API error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

**Error response format inconsistency**:
```typescript
// Different formats across routes
{ error: 'message' }                           // Most common
{ error: 'message', details: error.errors }    // With Zod validation
{ success: true, data: { ... } }               // Success response
{ error: { message: 'text' } }                 // Nested error (rare)
```

**Client-side error handling**:
```typescript
// Inconsistent patterns
.catch(() => ({ error: { message: 'Unknown error' } }))  // IncidentForm
.catch((err) => console.error('Failed to fetch games:', err))  // LinkPlayerForm
.catch(error => { console.error(...); setError(...) })  // Various
```

### Recommendation
1. **Use `withErrorHandling` wrapper for ALL API routes**
2. **Use helper functions** (`badRequest()`, `unauthorized()`, `notFound()`)
3. **Standardize error response shape** via `errorShape()` from `lib/logging`
4. **Let auth guards throw** - don't catch their errors manually

### Files to Update
1. All API routes without `withErrorHandling`
2. Routes with manual error handling for auth guards
3. Client components with inconsistent error handling

**Severity**: HIGH

---

## 7. Styling Patterns

### Pattern Found
**Two competing `cn()` utilities** and mostly consistent Tailwind usage.

### Inconsistencies

**HIGH SEVERITY**: Duplicate utility functions

**Duplicate `cn()` implementations**:

```typescript
// lib/cn.ts (SIMPLE - WRONG)
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

// lib/utils.ts (FULL - CORRECT)
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Files using `lib/cn.ts`** (⚠️ Wrong):
- `components/ui/input.tsx` → `import { cn } from '../../lib/cn'`
- `components/ui/card.tsx` → `import { cn } from '../../lib/cn'`

**Files using `@/lib/utils`** (✅ Correct):
- `components/ui/button.tsx`
- `components/ui/tabs.tsx`
- `components/ui/switch.tsx`
- `components/ui/label.tsx`
- `components/ui/badge.tsx`
- All other components

**Why this matters**: The simple version doesn't merge Tailwind classes properly:
```typescript
// With lib/cn.ts (WRONG - creates duplicate classes)
cn('p-4', 'p-6') // → "p-4 p-6" (both applied, conflict)

// With lib/utils.ts (CORRECT - merges properly)
cn('p-4', 'p-6') // → "p-6" (last one wins, no conflict)
```

**Color mapping patterns - INCONSISTENT naming**:
```typescript
// components/features/dashboard/IncidentCard.tsx
const severityColors = { low: '...', medium: '...', high: '...' }  // camelCase ❌
const statusColors = { active: '...', removed: '...', pending: '...' }  // camelCase ❌

// components/features/dashboard/FlagCard.tsx
const resolutionColors = { open: '...', dismissed: '...', approved: '...' }  // camelCase ❌

// components/features/recent-incidents/RecentIncidentsList.tsx
const categoryColors: Record<string, string> = { ... }  // camelCase ❌

// Should all be UPPER_SNAKE_CASE:
const SEVERITY_COLORS = { ... }
const STATUS_COLORS = { ... }
const RESOLUTION_COLORS = { ... }
const CATEGORY_COLORS = { ... }
```

**INCONSISTENT** Tailwind class application:
```typescript
// Some use template literals (harder to read/maintain)
className={`inline-flex items-center ... ${categoryColors[incident.category_label] || 'bg-slate-500/10 ...'}`}

// Some use cn() properly (PREFERRED)
className={cn(badgeVariants({ variant }), className)}

// Some use plain strings (OK for static classes)
className="w-full rounded border border-white/10 bg-black/40 px-3 py-2"
```

### Recommendation
1. **DELETE `lib/cn.ts`** completely
2. **Update `input.tsx` and `card.tsx`** to use `@/lib/utils`
3. **Rename all color mapping constants** to UPPER_SNAKE_CASE
4. **Prefer `cn()` over template literals** for conditional classes

### Files to Update
1. **DELETE**: `lib/cn.ts`
2. **UPDATE imports**:
   - `components/ui/input.tsx` - Change to `import { cn } from '@/lib/utils'`
   - `components/ui/card.tsx` - Change to `import { cn } from '@/lib/utils'`
3. **RENAME constants**:
   - `components/features/dashboard/IncidentCard.tsx` - `severityColors` → `SEVERITY_COLORS`, `statusColors` → `STATUS_COLORS`
   - `components/features/dashboard/FlagCard.tsx` - `resolutionColors` → `RESOLUTION_COLORS`
   - `components/features/recent-incidents/RecentIncidentsList.tsx` - `categoryColors` → `CATEGORY_COLORS`

**Severity**: HIGH

---

## 8. File Organization

### Pattern Found
**Well-structured** with clear route grouping and component organization.

### Inconsistencies

**MEDIUM SEVERITY**: Duplicate route patterns

**Route group duplication**:
```
app/
  (admin)/          ← Route group with layout
    layout.tsx
    audit/
      page.tsx
      
  admin/            ← Direct folder (also has layout!) ❌ DUPLICATE
    layout.tsx
    audit/
      page.tsx
    dashboard/
      page.tsx
    users/
      page.tsx
```

Similarly for moderator routes:
```
app/
  (moderator)/
    layout.tsx
    flags/
      page.tsx
      
  moderator/        ← DUPLICATE
    layout.tsx
    flags/
      page.tsx
```

**This creates confusion** - which route structure is canonical?
- URLs like `/admin/audit` and `/(admin)/audit` both exist
- Different layouts may be applied
- Maintenance nightmare

**Component organization** (✅ GOOD):
```
components/
  features/        ← Domain-specific components
    browse-filters/
    cards/
    dashboard/
    incident-form/
    moderation/
    player/
    user/
  layout/          ← Layout components
  ui/              ← Reusable UI primitives
```

### Recommendation
1. **Choose ONE route pattern** - recommend using route groups: `(admin)`, `(moderator)`
2. **Remove duplicate** `admin/` and `moderator/` folders
3. **Consolidate layouts** to avoid duplication

**Why route groups**: 
- Keep URLs clean (`/admin/audit` not `/(admin)/audit`)
- Share layouts without affecting URLs
- Organize related routes

### Files to Remove/Consolidate
1. Choose between `app/(admin)/` and `app/admin/` - recommend keeping route groups
2. Choose between `app/(moderator)/` and `app/moderator/`
3. Merge any unique pages/functionality

**Severity**: MEDIUM

---

## Summary of Findings

| Category | Severity | Issues Found | Priority |
|----------|----------|--------------|----------|
| Import Paths | HIGH | Mixed relative/absolute imports | 🔴 P0 |
| `cn()` Utility Duplication | HIGH | Two implementations | 🔴 P0 |
| Error Handling | HIGH | Inconsistent patterns | 🔴 P0 |
| Quote Style | LOW | Mixed single/double quotes | 🟡 P2 |
| Auth Guards | MEDIUM | Missing on some routes | 🟠 P1 |
| File Organization | MEDIUM | Duplicate route folders | 🟠 P1 |
| Naming (Constants) | MEDIUM | camelCase vs UPPER_SNAKE | 🟠 P1 |
| Supabase Usage | NONE | ✅ Excellent | ✅ N/A |

---

## Recommended Action Plan

### Phase 1: Critical Fixes (P0) - ~4 hours

1. **Consolidate `cn()` utilities**
   - Delete `lib/cn.ts`
   - Update `input.tsx` and `card.tsx` imports to use `@/lib/utils`
   - **Time**: 15 minutes
   
2. **Standardize imports to `@/` prefix**
   - Update `app/(app)/api/incidents/route.ts` (4 imports)
   - Update `components/features/incident-form/IncidentForm.tsx` (2 imports)
   - Update `components/ui/input.tsx` (1 import)
   - Update `components/ui/card.tsx` (1 import)
   - **Time**: 30 minutes

3. **Standardize error handling**
   - Wrap API routes with `withErrorHandling`
   - Remove manual try/catch for auth guards
   - Use helper functions consistently
   - **Time**: 3 hours

### Phase 2: Important Fixes (P1) - ~6 hours

4. **Fix auth guard usage**
   - Replace manual `getUser()` with `requireAuth()` in incidents route
   - Simplify error handling in admin routes
   - **Time**: 1 hour

5. **Consolidate route structure**
   - Decide on route group pattern
   - Remove duplicate folders
   - Merge layouts
   - **Time**: 2 hours

6. **Rename constants to UPPER_SNAKE_CASE**
   - Update `IncidentCard.tsx` (2 constants)
   - Update `FlagCard.tsx` (1 constant)
   - Update `RecentIncidentsList.tsx` (1 constant)
   - **Time**: 30 minutes

7. **Standardize component props**
   - Change `type Props` to `interface ComponentNameProps`
   - **Time**: 30 minutes

### Phase 3: Polish (P2) - ~2 hours

8. **Standardize quote style**
   - Update 5 shadcn/ui components to use `'use client'`
   - **Time**: 15 minutes

9. **Extract color constants**
   - Create `lib/constants/colors.ts`
   - Move all color mappings
   - Update imports
   - **Time**: 1 hour

---

## Detailed File Changes Required

### Files to Delete
- `lib/cn.ts`

### Files to Update - Import Paths
```typescript
// components/ui/input.tsx
- import { cn } from '../../lib/cn'
+ import { cn } from '@/lib/utils'

// components/ui/card.tsx
- import { cn } from '../../lib/cn'
+ import { cn } from '@/lib/utils'

// app/(app)/api/incidents/route.ts
- import { withErrorHandling, badRequest, unauthorized } from '../../../../lib/http'
- import { createSupabaseServer, createSupabaseAdmin } from '../../../../lib/supabase/server'
- import { IncidentInput } from '../../../../lib/validation/incident'
- import { checkRateLimit, recordSubmission } from '../../../../lib/rate-limit'
+ import { withErrorHandling, badRequest, unauthorized } from '@/lib/http'
+ import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase/server'
+ import { IncidentInput } from '@/lib/validation/incident'
+ import { checkRateLimit, recordSubmission } from '@/lib/rate-limit'

// components/features/incident-form/IncidentForm.tsx
- import { Input } from '../../ui/input'
- import { Button } from '../../ui/button'
+ import { Input } from '@/components/ui/input'
+ import { Button } from '@/components/ui/button'
```

### Files to Update - Constant Names
```typescript
// components/features/dashboard/IncidentCard.tsx
- const severityColors = { ... }
- const statusColors = { ... }
+ const SEVERITY_COLORS = { ... }
+ const STATUS_COLORS = { ... }

// Update usage:
- const severityColor = severityColors[incident.severity as keyof typeof severityColors]
+ const severityColor = SEVERITY_COLORS[incident.severity as keyof typeof SEVERITY_COLORS]
```

### Files to Update - Quote Style
```typescript
// components/ui/tabs.tsx, switch.tsx, label.tsx, alert-dialog.tsx, button.tsx
- "use client"
+ 'use client'
```

---

## Validation Checklist

After implementing fixes, verify:

- [ ] All imports use `@/` prefix (no `../../` paths)
- [ ] Only one `cn()` function exists (in `lib/utils.ts`)
- [ ] All API routes use `withErrorHandling`
- [ ] All error responses use helper functions
- [ ] All constants use UPPER_SNAKE_CASE
- [ ] All component props use `interface ComponentNameProps`
- [ ] All `'use client'` directives use single quotes
- [ ] No duplicate route folders (`admin/` vs `(admin)/`)
- [ ] All auth guards used correctly
- [ ] No manual `supabase.auth.getUser()` checks

---

## Estimated Total Time

| Phase | Hours |
|-------|-------|
| Phase 1 (P0) | 4 hours |
| Phase 2 (P1) | 6 hours |
| Phase 3 (P2) | 2 hours |
| **Total** | **12 hours** |

---

**Analysis Complete** ✅

*This consistency analysis complements the comprehensive code quality analysis in `CODE_QUALITY_ANALYSIS.md`*
