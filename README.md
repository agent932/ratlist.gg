# Ratlist.gg

A community incident board for extraction shooter games, allowing players to log encounters with other players and check their reputations before teaming up.

**⚠️ Disclaimer**: Ratlist.gg is a community-run informational site. It is not affiliated with or endorsed by any game studio. All incidents are user-generated opinions and should be used as context, not proof. No harassment, doxxing, or targeted abuse is permitted.

## Features

- 🔍 **Check Player Reputations**: Search for players across supported games and view their reputation tier (F-S) based on reported incidents
- 📝 **Log Incidents**: Authenticated users can report positive or negative encounters with other players
- 📊 **Browse Leaderboards**: View top-reported players and recent incidents filtered by game and time period
- 🔐 **Secure & Anonymous**: Row-level security with Supabase, optional anonymous reporting
- 🌙 **Dark Mode**: Game-themed dark interface optimized for readability

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Supabase (Postgres + Auth + RLS)
- **UI**: Tailwind CSS, shadcn/ui components, Radix UI primitives
- **Validation**: Zod schemas for type-safe API requests
- **Testing**: Playwright (E2E), Vitest (unit tests)
- **Deployment**: Vercel (frontend) + Supabase managed services

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ratlist.gg
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from the project settings
3. Run the migrations to set up the database schema:
   - In the Supabase dashboard, go to SQL Editor
   - Copy the contents of `supabase/migrations/0001_init.sql`
   - Execute the SQL
4. Seed the database:
   - Copy the contents of `supabase/seed/seed.sql`
   - Execute the SQL to add initial games and categories

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ratlist.gg/
├── app/                    # Next.js App Router pages and API routes
│   ├── (app)/             # Authenticated app routes
│   │   ├── browse/        # Browse leaderboards
│   │   ├── player/        # Player profile pages
│   │   ├── report/        # Incident submission
│   │   └── api/           # API route handlers
│   └── (marketing)/       # Public marketing pages
├── components/
│   ├── ui/                # shadcn/ui primitives
│   └── features/          # Feature-specific components
├── lib/
│   ├── supabase/          # Supabase client helpers
│   ├── validation/        # Zod schemas
│   ├── reputation.ts      # Reputation scoring logic
│   └── rate-limit.ts      # Rate limiting utilities
├── supabase/
│   ├── migrations/        # Database schema migrations
│   └── seed/              # Seed data scripts
├── tests/
│   ├── e2e/               # Playwright E2E tests
│   └── unit/              # Vitest unit tests
└── specs/                 # Feature specifications and plans
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run unit tests (Vitest)
- `npm run test:e2e` - Run E2E tests (Playwright)

## Key Features Implementation

### User Story 1: Check a Player

Users can search for a player by game and identifier to view:
- Reputation tier (F-S based on weighted incident score)
- Total report count
- Breakdown by incident category
- Recent incident history

**Implementation**: Server-side rendered player profile page with ISR (180s cache).

### User Story 2: Log an Incident

Authenticated users can submit incident reports including:
- Game and player identifier
- Incident category (betrayal, clutch save, etc.)
- Optional metadata (map, mode, region)
- Description (10-2000 characters)

**Implementation**: Client-side form with server-side validation, rate limiting (30s cooldown, 10/day), and automatic player upsertion.

### User Story 3: Browse the Ratlist

Users can explore:
- Top-reported players by score/report count (filtered by game and period)
- Recent incidents across all games

**Implementation**: Server-rendered browse page with client-side filters for game/period selection.

## Security & Privacy

- **Row Level Security (RLS)**: All database tables enforce RLS policies
- **Rate Limiting**: Per-user cooldowns and daily limits prevent spam
- **Anonymous Reporting**: Users can optionally hide their identity
- **Content Moderation**: Flag system for inappropriate incidents
- **Input Validation**: Zod schemas validate all API inputs
- **No PII**: Players identified by game-specific handles only

## Testing

### Unit Tests

```bash
npm test
```

Tests cover:
- Reputation scoring logic (`lib/reputation.ts`)
- Zod validation schemas (`lib/validation/*`)

### E2E Tests

```bash
npm run test:e2e
```

Smoke tests verify:
- Player profile page rendering
- Incident submission flow
- Browse page filters and pagination

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment

```bash
npm run build
npm start
```

## Contributing

This is a community project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test && npm run build`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: See `specs/001-foundation/quickstart.md`

---

Built with ❤️ for the extraction shooter community
