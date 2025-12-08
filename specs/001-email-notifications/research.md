# Research: Email Notifications Technical Decisions

**Feature**: 001-email-notifications  
**Created**: December 7, 2025  
**Purpose**: Resolve technical unknowns and document technology choices

## Research Questions

### 1. Email Service Provider Selection

**Question**: Which email service should we use - Resend, SendGrid, or alternative?

**Research Findings**:
- **Resend**: Modern developer-focused email API with React Email support
  - Free tier: 100 emails/day, 3,000/month
  - Pricing: $20/month for 50k emails
  - Native TypeScript SDK available
  - Excellent DX with React Email templates
  - Built for transactional emails
  
- **SendGrid**: Established provider with larger scale
  - Free tier: 100 emails/day
  - More complex API
  - Requires additional template management
  
- **Postmark**: Alternative transactional email service
  - More expensive ($15/month for 10k emails)
  - Good deliverability

**Decision**: Use **Resend**

**Rationale**:
- Native TypeScript support aligns with our strict typing requirement
- React Email integration allows reusable component-based templates (matches our component reusability principle)
- Free tier is adequate for MVP rollout (100 emails/day supports ~20 active users at 5 notifications/day)
- Simple API reduces implementation complexity
- Easy upgrade path to paid tier when scaling

**Alternatives Considered**: SendGrid (rejected due to complexity), Postmark (rejected due to cost)

---

### 2. Email Template Library

**Question**: How should we build HTML email templates while maintaining our component reusability principle?

**Research Findings**:
- **React Email**: React components that render to HTML emails
  - Components: `<Email>`, `<Head>`, `<Body>`, `<Container>`, `<Text>`, `<Button>`, `<Link>`
  - Full TypeScript support
  - Tailwind CSS support for email-safe styles
  - Official Resend integration
  
- **MJML**: XML-based email framework
  - More verbose syntax
  - Doesn't leverage React knowledge
  
- **Plain HTML Templates**: String-based templates
  - Violates component reusability principle
  - No type safety

**Decision**: Use **React Email** with TypeScript

**Rationale**:
- Aligns with Component Reusability principle - email templates are React components
- TypeScript support maintains our strict typing requirement
- Tailwind integration matches our Tailwind-First styling principle
- Resend has native React Email support
- Can reuse color tokens and design system from main app

**Alternatives Considered**: MJML (rejected - different paradigm), Plain HTML (rejected - no reusability)

---

### 3. Background Job Scheduling

**Question**: How should we schedule the batch email processor to run every 5 minutes?

**Research Findings**:

**Option A: Supabase Edge Functions + pg_cron**
- Supabase has pg_cron extension for PostgreSQL-based scheduling
- Can call Edge Function via HTTP from cron job
- Requires Supabase paid plan ($25/month) for pg_cron access
- Native integration with existing infrastructure

**Option B: Vercel Cron Jobs**
- Vercel provides scheduled serverless functions
- Syntax: `export const config = { runtime: 'edge' }` with cron schedule
- Free tier includes cron on Hobby plan
- Lives in `/app/api/cron/send-notifications/route.ts`
- Requires CRON_SECRET environment variable for security

**Option C: External Cron Service (cron-job.org, EasyCron)**
- Third-party service hits our API endpoint
- Adds external dependency
- Security concerns with public endpoint

**Decision**: Use **Vercel Cron Jobs**

**Rationale**:
- Free tier support - no additional cost
- Lives in our Next.js codebase as API route (aligns with existing structure)
- Simple deployment - no external dependencies
- Can secure with CRON_SECRET token
- Easy to test locally by calling API route directly
- Matches our deployment stack (Vercel + Supabase)

**Implementation**: 
```typescript
// app/api/cron/send-notifications/route.ts
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Called by Vercel Cron every 5 minutes
export async function GET(request: Request) {
  // Verify CRON_SECRET
  // Query fn_send_pending_notifications()
  // Send emails via Resend
  // Mark as sent via fn_mark_notification_sent()
}
```

**Alternatives Considered**: Supabase pg_cron (rejected - paid tier required), External cron (rejected - security/dependency concerns)

---

### 4. Retry Logic Implementation

**Question**: How should we implement exponential backoff for failed email sends?

**Research Findings**:

**Option A: Database-tracked retry count**
- Add `retry_count` and `last_retry_at` columns to notification_queue
- Batch processor increments retry_count on failure
- Check retry_count < 3 before retrying
- Calculate backoff: `5min * (2^retry_count)`

**Option B: Separate failed_notifications table**
- Move failed notifications to separate table
- Complex schema management

**Option C: In-memory retry within single batch**
- Retry immediately in same job execution
- Doesn't persist state across runs
- Won't work if job fails entirely

**Decision**: **Database-tracked retry count** (Option A)

**Rationale**:
- Persists state across batch runs (job might fail/timeout)
- Simple schema addition to existing notification_queue table
- Aligns with Supabase-First principle - database is source of truth
- Easy to query for monitoring (how many notifications are stuck retrying?)
- Supports exponential backoff calculation

**Database Schema Update**:
```sql
ALTER TABLE notification_queue
ADD COLUMN retry_count INT DEFAULT 0,
ADD COLUMN last_retry_at TIMESTAMPTZ;
```

**Alternatives Considered**: Separate table (rejected - over-engineering), In-memory (rejected - doesn't persist)

---

### 5. Email Content Security

**Question**: Should we sanitize incident descriptions before including in emails?

**Research Findings**:
- Incident descriptions are validated at submission via Zod schema (10-2000 chars)
- Supabase RLS prevents unauthorized access to incidents
- Email templates will HTML-escape content automatically (React Email does this)
- No user-supplied HTML in descriptions (plain text only)

**Decision**: **No additional sanitization needed**

**Rationale**:
- Input validation already exists at incident creation (Zod schema)
- React Email automatically escapes HTML entities
- Database RLS ensures we only query incidents user has access to
- No XSS risk in email context (email clients already sanitize)
- Assumption from spec: "Incident descriptions are safe to include in emails without additional sanitization beyond database validation"

**Alternatives Considered**: Add HTML sanitization library (rejected - unnecessary overhead)

---

### 6. Daily Count Reset Mechanism

**Question**: How should we reset notification_count_today at midnight UTC?

**Research Findings**:

**Option A: Separate cron job (once daily at midnight)**
- Calls SQL: `UPDATE user_profiles SET notification_count_today = 0`
- Simple but requires another scheduled job
- Vercel cron supports this

**Option B: Reset on first notification after midnight**
- Check last_notification_sent timestamp
- If day changed, reset count before incrementing
- Logic in trigger function or batch processor
- No separate job needed

**Option C: PostgreSQL generated column**
- Calculate count dynamically from notification_queue.sent_at
- Complex query, performance impact

**Decision**: **Separate cron job** (Option A)

**Rationale**:
- Clean separation of concerns
- Guaranteed to run at consistent time (midnight UTC)
- Simple SQL query with no logic complexity
- Can use existing Vercel Cron infrastructure
- Easy to monitor/log execution
- Aligns with spec requirement: "System MUST reset daily notification counts at midnight UTC using a scheduled job" (FR-006)

**Implementation**:
```typescript
// app/api/cron/reset-notification-counts/route.ts
// Runs daily at 00:00 UTC
export async function GET(request: Request) {
  await supabase.rpc('fn_reset_notification_counts');
}
```

**Alternatives Considered**: On-demand reset (rejected - spec requires scheduled job), Generated column (rejected - complexity)

---

## Technology Stack Summary

**Email Infrastructure**:
- **Email Service**: Resend (free tier: 100/day, $20/month for 50k)
- **Template Engine**: React Email with TypeScript
- **Styling**: Tailwind CSS (email-safe utilities)

**Background Jobs**:
- **Scheduler**: Vercel Cron Jobs (free tier)
- **Batch Processor**: Edge Function at `/app/api/cron/send-notifications/route.ts` (runs every 5 minutes)
- **Count Reset**: Edge Function at `/app/api/cron/reset-notification-counts/route.ts` (runs daily at midnight UTC)

**Retry Logic**:
- **Storage**: Database columns `retry_count`, `last_retry_at` in `notification_queue`
- **Strategy**: Exponential backoff (5min, 15min, 45min)
- **Max Retries**: 3 attempts before marking permanently failed

**Security**:
- **Cron Authentication**: CRON_SECRET environment variable
- **Content Safety**: Zod validation + React Email HTML escaping (no additional sanitization)
- **Email Access**: Supabase RLS + auth.users table

---

## Dependencies to Install

```json
{
  "dependencies": {
    "resend": "^3.2.0",
    "@react-email/components": "^0.0.15",
    "react-email": "^2.1.0"
  }
}
```

---

## Environment Variables Required

```env
# Resend API Key (get from resend.com dashboard)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Cron job security token (generate random string)
CRON_SECRET=your_secure_random_string_here

# Email sender configuration
EMAIL_FROM=notifications@ratlist.gg
```

---

## Implementation Risks & Mitigations

**Risk 1**: Free tier limits (100 emails/day)
- **Mitigation**: Monitor usage via Resend dashboard; upgrade to paid tier if needed
- **Early Warning**: Alert when approaching 80% of daily limit

**Risk 2**: Vercel Cron reliability
- **Mitigation**: Add logging to track execution; monitor for missed runs
- **Fallback**: Can manually trigger cron endpoints if needed

**Risk 3**: Email deliverability (spam folders)
- **Mitigation**: Use proper SPF/DKIM records (Resend provides these)
- **Monitoring**: Track bounce rates and open rates (SC-006: 40% open rate target)

**Risk 4**: Batch processor timeout (Vercel Edge Functions have 25s limit)
- **Mitigation**: Process max 100 notifications per batch (as specified in fn_send_pending_notifications)
- **Scaling**: If queue grows beyond 100, next batch picks up remainder

---

## Next Steps (Planning Phase)

1. ✅ Email service selection (Resend)
2. ✅ Template library choice (React Email)
3. ✅ Scheduler decision (Vercel Cron)
4. ✅ Retry logic design (database-tracked)
5. ✅ Security approach (existing validation sufficient)
6. ✅ Reset mechanism (separate cron job)

**Proceed to Phase 1**: Data model design and contract definition
