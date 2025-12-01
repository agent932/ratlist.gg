---

description: "Task list for Ratlist.gg foundation and P1 flows"
---

# Tasks: Ratlist.gg Foundation

**Input**: Design documents from `/specs/001-foundation/`
**Prerequisites**: plan.md (required), spec.md (user stories), research.md, data-model.md, contracts/

**Tests**: Per the Constitution, smoke tests are REQUIRED at minimum:
- Unit tests for critical logic used by P1 user stories
- One end-to-end happy path per P1 user story
Additional tests may be included as requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Next.js App Router project (TypeScript) and Tailwind
  - Path: `app/`, `layout.tsx`, `page.tsx`, `tailwind.config.ts`, `postcss.config.js`
- [x] T002 Install dependencies: `next`, `react`, `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`, `tailwindcss`, `@radix-ui/*`, `shadcn/ui`, `zod`, `lucide-react`, `swr`
- [x] T003 [P] Configure shadcn/ui and generate base UI primitives in `components/ui/*`
- [x] T004 [P] Configure ESLint + Prettier and CI workflow (lint + test) `.github/workflows/ci.yml`
- [x] T005 Create Supabase client helpers: `lib/supabase/server.ts`, `lib/supabase/client.ts`
- [x] T006 Create logging/util libraries: `lib/logging.ts`, `lib/validation/*`, `lib/reputation.ts`
- [x] T007 Add global styles and theme (dark default) `app/globals.css`
- [x] T008 Setup env config and examples: `.env.local.example` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create Supabase migrations for schema (SQL files under `supabase/migrations/`)
  - Tables: `games`, `players`, `incident_categories`, `incidents`, `flags`, `user_profiles`
- [x] T010 Seed data for `games` and `incident_categories` under `supabase/seed/`
- [x] T011 Add indexes: players (game_id, identifier), trigram on identifier, incidents composite indexes + tsvector
- [x] T012 Create view `player_reputation_view` and RPCs: `fn_get_player_profile`, `fn_get_leaderboard`, `fn_get_recent_incidents`
- [x] T013 Enable RLS and write policies for all tables per plan (read publics, insert/edit own, moderator role)
- [x] T014 Implement `/app/(app)/api/health/route.ts` returning readiness + DB connectivity
- [x] T015 Global error handler response shape and logging integration (traceId) in route handlers
- [x] T016 Configure Supabase Auth providers (magic link + GitHub/Discord); wire `auth/callback` pages
- [x] T017 [P] Add sitewide disclaimers and policy pages/sections (UGC, not affiliated, no enforcement) `app/(marketing)/faq/page.tsx`
- [x] T018 [P] Trust & Safety: content flagging foundation (table `flags`, basic moderation status values)
- [x] T019 [P] UI scaffolding: header/nav, hero shell, footer; `components/features/hero/*`, `components/features/cards/*`
- [x] T01A [P] Validation schemas (Zod): `IncidentInput`, `PlayerSearchInput` `lib/validation/*`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Check a player (Priority: P1) 🎯 MVP

**Goal**: Quickly decide if a player seems trustworthy or notorious.

**Independent Test**: Player profile page renders with reputation tier and recent incidents for given game/id.

### Tests for User Story 1 (REQUIRED smoke tests) ⚠️

- [ ] T020 [P] [US1] Contract test: GET `/app/(app)/api/search/player/route.ts` returns player summary by game + identifier (tests/contract)
- [x] T021 [P] [US1] E2E: Visit `/player/[game]/[playerId]` and see tier + category counts + recent incidents (tests/e2e)

### Implementation for User Story 1

- [x] T022 [P] [US1] Build search API handler `app/(app)/api/search/player/route.ts` (debounced search)
- [x] T023 [P] [US1] Player profile page SSR `app/(app)/player/[game]/[playerId]/page.tsx` (uses view/RPC)
- [ ] T024 [P] [US1] Player components: `components/features/player-profile/*`, `components/features/incident-list/*`
- [x] T025 [US1] Add server-side data fetching + ISR revalidation (120–300s)
- [ ] T026 [US1] Add indexes/tuning if slow queries detected (migrations update)

**Checkpoint**: User Story 1 independently functional and testable

---

## Phase 4: User Story 2 - Log an incident (Priority: P1)

**Goal**: Record a notable encounter with another player.

**Independent Test**: Authenticated user submits incident; sees confirmation and incident appears on player page.

### Tests for User Story 2 (REQUIRED smoke tests) ⚠️

- [ ] T027 [P] [US2] Contract test: POST `/app/(app)/api/incidents/route.ts` validates + creates incident (tests/contract)
- [x] T028 [P] [US2] E2E: Sign in → submit incident on `/report` → redirect/confirm → player page shows new incident (tests/e2e)

### Implementation for User Story 2

- [x] T029 [P] [US2] Incident form UI `components/features/incident-form/*` (game, identifier, category, occurred_at, description, toggles)
- [x] T02A [US2] `/report` page `app/(app)/report/page.tsx` loads games/categories server-side; client form
- [x] T02B [US2] Route handler `app/(app)/api/incidents/route.ts` with Zod validation + RLS-compliant insert
- [x] T02C [US2] Upsert player on incident if not exists (server-side)
- [x] T02D [US2] Revalidate tags/pages for affected player and browse lists after submit
- [x] T02E [US2] Add basic rate limiting (per-user/per-IP) in handler; cooldown of 30s between submits

**Checkpoint**: User Story 2 independently functional and testable

---

## Phase 5: User Story 3 - Browse the ratlist (Priority: P2)

**Goal**: Explore leaderboards and recent incidents.

**Independent Test**: Browse page shows top players for selected game/period and paginated recent incidents.

### Tests for User Story 3 (REQUIRED smoke tests) ⚠️

- [ ] T02F [P] [US3] Contract test: leaderboard fetch via RPC returns expected ordering/shape (tests/contract)
- [x] T030 [P] [US3] E2E: Visit `/browse`, filter by game/period, pagination works (tests/e2e)

### Implementation for User Story 3

- [x] T031 [P] [US3] Browse page SSR `app/(app)/browse/page.tsx` with server data fetch + client filters
- [x] T032 [US3] Leaderboard components `components/features/leaderboard/*` (tables/cards)
- [x] T033 [US3] Recent incidents list with cursor pagination; query indexes

**Checkpoint**: All three user stories independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T034 [P] Documentation updates in `specs/001-foundation/quickstart.md` and README
- [ ] T035 Code cleanup and refactoring; extract shared UI patterns
- [ ] T036 Performance optimization across SSR/ISR; tune revalidate intervals; add CDN cache headers for GET APIs
- [x] T037 [P] Additional unit tests for `lib/reputation.ts` and validators `lib/validation/*`
- [x] T038 Security hardening: CSP headers, CORS allowlist for non-local
- [ ] T039 Run and validate `/api/health`; add uptime monitoring
- [ ] T03A Moderation surface: basic flags list for moderators (internal route placeholder)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on auth + incidents table
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on reputation view/RPC

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models/migrations before services/handlers
- Handlers before pages relying on their mutations
- Core implementation before integration/UI polish
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members
