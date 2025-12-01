# Implementation Plan: Ratlist.gg Foundation

**Branch**: `[001-foundation]` | **Date**: 2025-12-01 | **Spec**: /specs/001-foundation/spec.md
**Input**: Feature specification from `/specs/001-foundation/spec.md`

**Note**: This plan implements the product foundation (architecture, routing, schema, security, UI system) for Ratlist.gg using Next.js (App Router) and Supabase.

## Summary

Build Ratlist.gg as a Next.js App Router application with Supabase for Postgres, Auth, and Row Level Security. Public content (home, browse, player pages, FAQ) renders via SSR/ISR for SEO; interactive actions (search, submit incident, flag) use lightweight route handlers and client forms. Data model centers on `games`, `players` (per-game identity), `incidents`, with optional `incident_categories`, `user_profiles`, and `flags`. Reputation tier is computed per game from incident history via a SQL view and cached by ISR; can evolve to a materialized view or trigger-updated summary table.

## Technical Context

**Language/Version**: TypeScript (Next.js 14+ App Router), React 18
**Primary Dependencies**: `next`, `react`, `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`, `tailwindcss`, `@radix-ui/*`, `shadcn/ui`, `zod`, `lucide-react`, `swr` or `react-query` (optional)
**Storage**: Supabase Postgres (managed), Supabase Auth
**Testing**: Playwright (E2E smoke), Vitest or Jest (unit), ESLint + Prettier
**Target Platform**: Vercel (Next.js) + Supabase (DB/Auth); local dev via `supabase start`
**Project Type**: web
**Performance Goals**: p95 API latency < 300ms for P1 endpoints; CWV p75: LCP < 2.5s, INP < 200ms, CLS < 0.1
**Constraints**: Secure by default (RLS on), no secrets in repo, preview deploys for PRs
**Scale/Scope**: Initial MVP for multiple games; 10k–100k incidents target ready (indexes + pagination)

## Constitution Check

- Security Baseline: Auth for submissions/flags; input validation with Zod; secrets via env; TLS by platform.
- Accessibility & UX: WCAG 2.1 AA for primary flows; semantic HTML; keyboard navigation and visible focus states; responsive.
- Testing & CI: Unit tests for scoring/utils; Playwright E2E for player lookup + incident submit; CI blocks on fail.
- Observability & Health: Structured JSON logs in route handlers; stable error shape with trace id; `/api/health` endpoint; Sentry hook.
- Performance & Simplicity: Minimal deps; ISR for heavy read pages; indexes for search/list; avoid premature abstractions.
- Community Content Policy: Sitewide disclaimers; prohibit PII/slurs/threats; visible flag/appeal; per‑game, descriptive tiers.
- Product Scope alignment: Multi-game; incidents required fields; per‑game identity; reputation per game.

## High-Level Architecture

- Next.js (App Router): server components for read pages (SSR/ISR), client components for forms and interactive widgets.
- Supabase: Postgres schema + RLS; Auth (magic links + OAuth providers like GitHub/Discord); `supabase-js` from server and client as needed.
- Data access:
  - Server components call Supabase (service role via server-side env for protected admin reads only if required; otherwise anon key for public reads with RLS).
  - Route Handlers in `/app/api/*` for mutations (submit incident, flag content) and search APIs when needed.
- Caching:
  - ISR for home, browse, player pages (revalidate intervals 60–300s).
  - Client-side SWR for search-as-you-type.
- Observability: Sentry for frontend and server handlers; pino-like logger emitting JSON to stdout.

## SSR/ISR/CSR Strategy by Page

- `/` (Home): ISR (60–300s). Data: top incidents/players per game snapshot; FAQ preview; categories. SEO-friendly.
- `/browse`: SSR with query params; server fetch of leaderboards + recent incidents; client filters hydrate via SWR.
- `/player/[game]/[playerId]`: SSR (revalidate 120–300s) for profile + incident summary; client paginated incident list via fetch or RSC pagination.
- `/report`: Client page with protected form (requires auth). Prefetch games and categories server-side; submit via POST `/api/incidents`.
- `/games`: ISR (daily). Data: list of supported games.
- `/faq`: SSG/ISR (rarely changes). Static content with accordion.
- `/auth/*`: Client-only routes/components provided by Supabase Auth helpers (login, callback).
- `/api/*`: Route handlers (edge-friendly where possible) for mutations and search.
- `/health` or `/api/health`: Lightweight JSON indicating app readiness and DB connectivity.

## Routing and Pages (App Router)

- `/` — Purpose: Landing with search + CTA; Data: featured players/incidents; ISR 120s.
- `/report` — Purpose: Submit incident; Data: games, categories; Client-only form; auth required.
- `/player/[game]/[playerId]` — Purpose: Player profile & reputation per game; Data: player core + stats + recent incidents; SSR with ISR.
- `/browse` — Purpose: Explore leaderboards and recent incidents; Data: aggregates; SSR with client filters.
- `/games` — Purpose: List supported games; Data: games; ISR daily.
- `/faq` — Purpose: Disclaimers and rules; Data: static; SSG/ISR.
- `/auth/sign-in`, `/auth/callback` — Purpose: Auth flows; Client; no SSR.
- `/api/incidents` (POST) — Purpose: Create incident; Auth required; validates input; returns created entity.
- `/api/flags` (POST) — Purpose: Flag incident; Auth required; records flag.
- `/api/search/player` (GET) — Purpose: Search by game + identifier; public; rate-limited.
- `/api/health` (GET) — Purpose: Health check.

## Data Model & Supabase Schema

Tables (schema `public`):

- `games`
  - `id` (uuid, pk, default gen_random_uuid())
  - `slug` (text, unique, e.g., `tarkov`, `dark-and-darker`)
  - `name` (text, unique)
  - `created_at` (timestamptz, default now())
  - Indexes: unique on `slug`, `name`.

- `players`
  - `id` (uuid, pk)
  - `game_id` (uuid, fk -> games.id)
  - `identifier` (text) — game-specific handle/ID
  - `display_name` (text) — optional prettified label
  - `created_at` (timestamptz)
  - Constraints: unique (`game_id`, `identifier`)
  - Indexes: btree (`game_id`, `identifier`); optional trigram on `identifier` for fuzzy search

- `incident_categories`
  - `id` (smallint, pk)
  - `slug` (text, unique)
  - `label` (text)
  - Seed examples: `betrayal`, `extract-camping`, `stream-sniping`, `team-violation`, `clutch-save`

- `incidents`
  - `id` (uuid, pk)
  - `game_id` (uuid, fk -> games.id)
  - `reported_player_id` (uuid, fk -> players.id)
  - `reporter_user_id` (uuid, fk -> auth.users.id)
  - `category_id` (smallint, fk -> incident_categories.id)
  - `occurred_at` (timestamptz) — approximate date/time
  - `description` (text) — short story (limit ~1k–2k chars)
  - `region` (text, nullable)
  - `mode` (text, nullable)
  - `map` (text, nullable)
  - `is_anonymous` (boolean, default false)
  - `created_at` (timestamptz, default now())
  - Indexes: (`reported_player_id`, `created_at`), (`game_id`, `created_at`), (`category_id`, `created_at`), GIN tsvector on `description` for search

- `flags` (moderation)
  - `id` (uuid, pk)
  - `incident_id` (uuid, fk -> incidents.id)
  - `flagger_user_id` (uuid, fk -> auth.users.id)
  - `reason` (text)
  - `status` (text, default 'open') — open/closed
  - `created_at` (timestamptz, default now())
  - Unique: (`incident_id`, `flagger_user_id`) to prevent duplicates

- `user_profiles` (optional)
  - `user_id` (uuid, pk -> auth.users.id)
  - `display_name` (text)
  - `created_at` (timestamptz)

Views/Computed:

- `player_reputation_view` — per (`game_id`, `reported_player_id`):
  - Columns: `game_id`, `player_id`, `report_count`, `last_incident_at`, `category_counts` (jsonb), `score` (int)
  - `score` formula example: sum of weighted categories (negative for griefing, positive for clutch saves)
  - Tier mapping in query: F–S via CASE on `score`
  - Index on view source tables suffice; may upgrade to materialized view for scale.

RPC Functions:

- `fn_get_player_profile(game_slug text, identifier text)` → returns player + reputation + recent incidents
- `fn_get_leaderboard(game_slug text, period text)` → returns top players by `score`/reports for period (week/month)
- `fn_get_recent_incidents(game_slug text, limit int)` → returns latest incidents

## Auth & Security (Supabase)

Auth strategy:
- Magic links (email) + OAuth (GitHub, Discord). Minimal friction; no password handling.

Access levels:
- Anonymous: read public tables (`games`, `incident_categories`, `players` minimal, `incidents` with reporter identity hidden).
- Authenticated: can submit incidents; can flag incidents; can edit/delete own incidents (within window, e.g., 15 minutes or until moderated).
- Moderator (role via `user_profiles.role = 'moderator'` or Supabase custom claims): can hide/remove incidents and close flags.

RLS policies (examples):
- `games`, `incident_categories`: `SELECT` for `anon` and `authenticated`.
- `players`: `SELECT` for all; inserts via server handler when upserting on incident creation.
- `incidents`:
  - `SELECT`: allow all, but return `reporter_user_id` null to public via view/select list; sensitive fields restricted.
  - `INSERT`: `auth.uid() = reporter_user_id`.
  - `UPDATE`/`DELETE`: only where `reporter_user_id = auth.uid()` and within grace window; moderators bypass via role check.
- `flags`:
  - `SELECT`: author or moderators; aggregate counts can be exposed via view for public.
  - `INSERT`: `auth.uid() = flagger_user_id`.

Abuse mitigation:
- Per-user daily incident cap (e.g., 10/day) enforced in route handler and optional DB constraint with trigger.
- Cooldown between reports (e.g., 30s) at app layer; rate limiting by IP via middleware (e.g., Upstash Redis) or simple in-memory dev strategy.
- Basic content filter (length limits, banned terms list) + PII/slur/threat rejection.

## Frontend Components & UI System

- Layout: fixed header/nav; central hero panel with search + CTA; grid of feature cards; FAQ accordion; dark, game-themed (original branding).
- Components (shadcn/ui + Radix):
  - Navigation: `NavigationMenu`, `Button`, `DropdownMenu` (profile)
  - Hero: `Input` (search), `Button`, `Card`
  - Cards: `Card`, `Badge`, `Separator`
  - Player: `Avatar`, `Card`, `Tabs`, `Table`/`DataTable`, `Badge`
  - Incidents: `Textarea`, `Select` (categories, game), `Popover`/`Calendar` for date, `Accordion` (details)
  - FAQ: `Accordion`
  - Feedback: `Toast`/`Sonner`
- Organization:
  - `components/ui/*` (generated shadcn primitives)
  - `components/features/*` (hero, search, player-profile, incident-list, incident-form, leaderboard, faq)
  - `app/(marketing)`, `app/(app)` route groups; `app/layout.tsx`, `app/page.tsx`
  - `lib/supabase/server.ts|client.ts`, `lib/validation/*`, `lib/logging.ts`, `lib/reputation.ts`

## Data Fetching & State Management

- Server data fetching in RSC for initial render; Supabase service initialized with anon key on server; auth via cookies for user-specific endpoints.
- Search players: client component with debounced query to `/api/search/player` (or direct Supabase from client with RLS).
- Submit incident: client form (Zod schema) posts to `/api/incidents`; on success, optimistic append to list or redirect to player page; ISR revalidate tag for affected pages.
- Browse leaderboards: SSR initial + client filter/sort via query params; paginate with cursor-based pagination.
- Keep UI snappy: combine SSR for SEO with client SWR for updates; use `revalidateTag`/`cache` where appropriate.

## Cross-Cutting Concerns

Validation:
- Zod schemas: `IncidentInput` (game_id, identifier, category_id, occurred_at, description, region/mode/map optional, is_anonymous)
- Enforce length and allowed characters; strip/escape dangerous content.

Moderation hooks:
- `POST /api/flags` to create a flag; moderation dashboard (internal route later) reads `flags`.
- Reporter identity hidden to public; exposed to moderators only.

Observability:
- Log key events: `incident.created`, `incident.flagged`, `player.searched` with trace id and user-id (if present).
- Sentry DSN configured for client + server; redaction of PII.

Performance:
- Pagination everywhere: `limit 20` + cursor (`created_at`, `id`).
- Indexes listed above; optional trigram index for `players.identifier`.
- Caching: ISR/`revalidate` on pages; CDN caching of API GETs with `Cache-Control` where safe.

## Project Structure

### Documentation (this feature)

```text
specs/001-foundation/
├── plan.md              # This file
├── research.md          # Phase 0 (to be created)
├── data-model.md        # Phase 1 (to be created)
├── quickstart.md        # Phase 1 (to be created)
├── contracts/           # Phase 1 (RPC/sql contract sketches)
└── tasks.md             # Phase 2 (/speckit.tasks output)
```

### Source Code (repository root)

```text
app/
├── (marketing)/
│   ├── page.tsx           # Home
│   └── faq/page.tsx       # FAQ
├── (app)/
│   ├── report/page.tsx
│   ├── browse/page.tsx
│   ├── games/page.tsx
│   ├── player/[game]/[playerId]/page.tsx
│   └── api/
│       ├── incidents/route.ts   # POST
│       ├── flags/route.ts       # POST
│       ├── search/player/route.ts # GET
│       └── health/route.ts      # GET
├── layout.tsx
└── page.tsx

components/
├── ui/...
└── features/
    ├── hero/
    ├── search/
    ├── cards/
    ├── player-profile/
    ├── incident-list/
    ├── incident-form/
    └── faq/

lib/
├── supabase/
│   ├── server.ts
│   └── client.ts
├── validation/
├── logging.ts
└── reputation.ts

tests/
├── e2e/
└── unit/

supabase/
├── migrations/
└── seed/
```

**Structure Decision**: Web application (frontend + backend via App Router route handlers) with Supabase as backend. Uses route groups for marketing vs app routes, shadcn/ui in `components/ui`, and feature modules in `components/features`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
