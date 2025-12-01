# Vercel Deployment Setup

Your build is failing in Vercel because the required environment variables are not configured.

## Required Environment Variables

Add these in your Vercel project settings (Settings → Environment Variables):

### For All Environments (Production, Preview, Development):

1. **NEXT_PUBLIC_SUPABASE_URL**
   ```
   https://fwrekewxtcikwwfapjzk.supabase.co
   ```

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3cmVrZXd4dGNpa3d3ZmFwanprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTExNTcsImV4cCI6MjA3OTk2NzE1N30.tmzCv7irHHNfN0nXNUkg9F3ereNpAmopXhfUZVXzd7M
   ```

3. **SUPABASE_SERVICE_ROLE_KEY** (⚠️ Production & Preview only - DO NOT expose publicly)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3cmVrZXd4dGNpa3d3ZmFwanprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5MTE1NywiZXhwIjoyMDc5OTY3MTU3fQ.UJJxWEhK62VX1SCDg5g3kBwLuiZfxuHOwRBcglunsT8
   ```

## Steps to Add Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. For each variable above:
   - Click "Add New"
   - Enter the variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter the value
   - Select which environments to apply it to (Production, Preview, Development)
   - Click "Save"

4. After adding all variables, redeploy:
   - Go to **Deployments**
   - Click the three dots (•••) on the latest failed deployment
   - Click "Redeploy"

## Supabase Configuration

After your first successful deployment, you also need to update Supabase:

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel production URL to **Site URL**:
   ```
   https://your-project.vercel.app
   ```
4. Add to **Redirect URLs**:
   ```
   https://your-project.vercel.app/auth/callback
   https://your-project.vercel.app/**
   ```

## Verify Deployment

Once environment variables are added and you redeploy:

1. The build should complete successfully
2. Visit your deployed site
3. Test the sign-in flow
4. Test creating an incident report

## Security Note

⚠️ **IMPORTANT**: The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security (RLS) and should NEVER be exposed to the client or committed to git. It should only be used in server-side code and stored as an environment variable in Vercel.
