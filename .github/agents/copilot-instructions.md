````chatagent
# ratlist.gg Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-07

## Active Technologies

- **TypeScript 5.4.5** + Next.js 14.2.33 (App Router) (baseline)
- **Supabase** (PostgreSQL + Auth + RLS) (baseline)
- **Tailwind CSS 3.4.1** + shadcn/ui (baseline)
- **Resend 3.2.0** email service + React Email 2.1.0 (001-email-notifications)
- **Vercel Cron Jobs** for scheduled tasks (001-email-notifications)

## Project Structure

```text
app/                    # Next.js App Router pages and API routes
  (app)/                # Authenticated app routes
  (marketing)/          # Public marketing pages
  api/                  # API route handlers
    cron/               # Scheduled cron jobs (Vercel Cron)
components/
  emails/               # React Email templates (NEW)
  features/             # Feature-specific components
  ui/                   # shadcn/ui primitives
lib/
  email/                # Email service utilities (NEW)
  supabase/             # Supabase client helpers
  validation/           # Zod schemas
  utils/                # Utility functions
supabase/
  migrations/           # Sequential database migrations
  seed/                 # Seed data scripts
specs/                  # Feature specifications
```

## Commands

```bash
npm run dev              # Start development server
npm run build            # Build production bundle
npm run lint             # Run ESLint
npm test                 # Run unit tests (Vitest)
supabase db push         # Apply migrations
```

## Code Style

**TypeScript**: Strict mode enabled, no `any` types  
**React**: Server Components preferred, Client Components when needed  
**Styling**: Tailwind utilities only, no custom CSS files  
**Database**: Migration-driven schema, RLS policies enforced  
**Email Templates**: React Email components with Tailwind  

## Recent Changes

- 001-email-notifications: Added Resend email service, React Email templates, Vercel Cron Jobs for batch processing

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

````
