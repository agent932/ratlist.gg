# Quickstart Guide: Ratlist.gg Development

This guide will get you up and running with Ratlist.gg in under 10 minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Supabase account created at [supabase.com](https://supabase.com)
- [ ] Git installed

## Step-by-Step Setup

### 1. Project Setup (2 minutes)

```bash
# Clone the repository
git clone <repository-url>
cd ratlist.gg

# Install dependencies
npm install
```

### 2. Supabase Configuration (5 minutes)

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose an organization (or create one)
4. Fill in project details:
   - **Name**: ratlist-dev
   - **Database Password**: (generate a strong password)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for development
5. Wait for project to be provisioned (~2 minutes)

#### Copy Project Credentials

1. In the Supabase dashboard, go to **Settings** > **API**
2. Copy the **Project URL** (e.g., `https://abc123.supabase.co`)
3. Copy the **anon/public** key (starts with `eyJ...`)

#### Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/0001_init.sql` from your project
4. Paste into the SQL Editor
5. Click **Run** or press Ctrl+Enter
6. Verify success message appears

#### Seed Initial Data

1. Still in SQL Editor, create a new query
2. Copy contents of `supabase/seed/seed.sql`
3. Paste and run
4. This creates initial games (Tarkov, Dark and Darker) and incident categories

#### Configure Authentication

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Enable **Email** provider (magic links - enabled by default)
3. Optionally enable **GitHub** or **Discord** OAuth:
   - Follow the provider-specific setup instructions
   - Add redirect URLs: `http://localhost:3000/auth/callback`

### 3. Environment Variables (1 minute)

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual values from step 2.

### 4. Start Development Server (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the Ratlist.gg home page!

## Verify Your Setup

### Check Database Connection

1. Navigate to [http://localhost:3000/api/health](http://localhost:3000/api/health)
2. You should see: `{"status":"ok","timestamp":"..."}`

### Test User Flow

1. **Browse Games**:
   - Click "Browse" in the navigation
   - Select different games and time periods
   - Leaderboard should show "No data" (empty database)

2. **Sign In**:
   - Click "Report" in the navigation
   - You'll be prompted to sign in
   - Use magic link (enter your email)
   - Check your email and click the verification link

3. **Submit Test Incident**:
   - After signing in, navigate to `/report`
   - Fill out the form:
     - **Game**: Tarkov
     - **Player Identifier**: `test-player-123`
     - **Category**: Betrayal
     - **Description**: "Killed me in extract"
   - Submit the form
   - You should see a success message

4. **View Player Profile**:
   - Navigate to `/player/tarkov/test-player-123`
   - You should see the incident you just created
   - Reputation tier should be "F" (negative score from betrayal)

## Troubleshooting

### Error: "Invalid Supabase credentials"

- Verify your `.env.local` file has correct values
- Make sure you copied the **anon** key, not the service role key
- Restart the dev server after changing `.env.local`

### Error: "Database connection failed"

- Verify migrations ran successfully in Supabase SQL Editor
- Check your Supabase project is active (not paused)
- Try running migrations again

### Auth redirect not working

- Make sure redirect URL is configured in Supabase dashboard
- For local development, use: `http://localhost:3000/auth/callback`
- For production, add your domain: `https://yourdomain.com/auth/callback`

### Build errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

## Next Steps

### Development Workflow

1. **Make changes** to components or pages
2. **Hot reload** automatically refreshes the browser
3. **Run tests** before committing: `npm test && npm run build`
4. **Commit and push** to your repository

### Adding Data

To populate your dev database with more data:

```sql
-- Add more games
INSERT INTO public.games (slug, name) VALUES
  ('hunt-showdown', 'Hunt: Showdown'),
  ('deadlock', 'Deadlock');

-- Add custom incident categories
INSERT INTO public.incident_categories (id, slug, label) VALUES
  (10, 'friendly-fire', 'Friendly Fire'),
  (11, 'toxic-comms', 'Toxic Communication');
```

### Testing with Real Users

For testing with friends:

1. Deploy to Vercel (see main README)
2. Add production URL to Supabase auth redirect URLs
3. Share the URL with testers
4. Monitor logs in Vercel and Supabase dashboards

### Running Tests

```bash
# Unit tests (fast)
npm test

# E2E tests (requires dev server running)
npm run test:e2e
```

## Common Development Tasks

### Add a New Game

1. Insert into `games` table via Supabase SQL Editor:
   ```sql
   INSERT INTO public.games (slug, name) VALUES ('your-game', 'Your Game Name');
   ```
2. Game will appear in dropdowns automatically

### Add a New Incident Category

1. Insert into `incident_categories`:
   ```sql
   INSERT INTO public.incident_categories (id, slug, label) VALUES
     (20, 'your-category', 'Your Category Label');
   ```
2. Update reputation weights in `lib/reputation.ts` if needed:
   ```typescript
   export const DEFAULT_WEIGHTS: CategoryWeights = {
     // ... existing weights
     'your-category': -2, // negative for bad behavior, positive for good
   }
   ```

### Modify Reputation Tiers

Edit `lib/reputation.ts`:

```typescript
export function tierFromScore(score: number) {
  if (score <= -20) return 'F'
  if (score <= -10) return 'D'
  // Adjust thresholds as needed
  // ...
}
```

### Change Rate Limits

Edit `lib/rate-limit.ts`:

```typescript
const COOLDOWN_MS = 30_000; // Change cooldown period
const DAILY_LIMIT = 10;     // Change daily submission limit
```

For production, replace in-memory Maps with Redis/Upstash.

## Production Deployment

See the main README for full deployment instructions. Quick version:

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push to main
5. Add production URL to Supabase auth settings

## Getting Help

- **Documentation**: See `specs/001-foundation/plan.md` for technical details
- **Issues**: Create a GitHub issue for bugs
- **Questions**: Check existing issues or create a new one

Happy coding! 🚀
