# Implementation Plan: Email Notifications for Incident Reports

**Branch**: `001-email-notifications` | **Date**: 2025-12-07 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-email-notifications/spec.md`

## Summary

Send email notifications to users when incidents are reported against their linked players. Notifications are queued in the database upon incident creation, processed in batches every 5 minutes via Vercel Cron, and sent using Resend email service with React Email templates. Includes retry logic with exponential backoff (3 attempts max), rate limiting (5 emails/day per user), and daily counter reset at midnight UTC.

**Technical Approach** (from research):
- **Email Service**: Resend (free tier: 100/day)
- **Templates**: React Email with TypeScript + Tailwind
- **Scheduler**: Vercel Cron Jobs (every 5 minutes for sending, daily at midnight for resets)
- **Retry**: Database-tracked with exponential backoff (5min, 15min, 45min)
- **Infrastructure**: Existing notification_queue table + new retry columns

## Technical Context

**Language/Version**: TypeScript 5.4.5  
**Primary Dependencies**: Next.js 14.2.33 (App Router), Resend 3.2.0, React Email 2.1.0, @react-email/components 0.0.15  
**Storage**: Supabase PostgreSQL (existing tables: notification_queue, user_profiles, incidents)  
**Testing**: Manual testing + production validation (no automated tests per Constitution Principle V)  
**Target Platform**: Vercel Edge Functions (email sender), Web (email templates)  
**Project Type**: Web application (Next.js fullstack)  
**Performance Goals**: 95% delivery rate, <5 minute delivery time, 1000+ notifications per batch  
**Constraints**: 25s Vercel Edge Function timeout, 100 emails/day Resend free tier, 5 emails/day per user rate limit  
**Scale/Scope**: ~100-1000 users, batch size 100 notifications, 2 new API routes, 4 new React Email components, 1 database migration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Component Reusability (Principle I - NON-NEGOTIABLE)
- **Status**: PASS
- **Analysis**: Email templates will be built as React components using React Email library, reusing existing Tailwind design tokens (colors, spacing). Email UI components (EmailButton, EmailHeader, EmailFooter) will be created once and reused across future email templates. No duplication.
- **Justification**: Aligns with principle - creating minimal components with maximum reusability.

### ✅ TypeScript Strict Mode (Principle II - NON-NEGOTIABLE)
- **Status**: PASS
- **Analysis**: All code will use TypeScript strict mode. Email template props interface defined with explicit types. Resend SDK has full TypeScript support. Database queries use typed Supabase client.
- **No `any` types**: All external data (Resend responses, RPC results) will be explicitly typed or validated.

### ✅ Tailwind-First Styling (Principle III - NON-NEGOTIABLE)
- **Status**: PASS
- **Analysis**: React Email supports Tailwind utilities for email-safe styling. All email templates will use Tailwind classes. No custom CSS files created. Design tokens from `tailwind.config.ts` will be referenced.
- **Email-Safe Subset**: React Email automatically converts Tailwind to inline styles for email client compatibility.

### ✅ Supabase-First Data Layer (Principle IV - NON-NEGOTIABLE)
- **Status**: PASS
- **Analysis**: New database columns added via migration 0017 (retry_count, last_retry_at, permanently_failed). All data operations use Supabase RPC functions (fn_send_pending_notifications, fn_mark_notification_sent). No raw SQL in application code.
- **Migration-Driven**: Schema changes follow existing pattern (numbered migration files).

### ✅ No Testing Required (Principle V)
- **Status**: PASS
- **Analysis**: No automated tests required per constitution. Quality gate is `npm run build` passing. Manual testing via triggering cron endpoints. Production validation via monitoring Resend dashboard and database queries.
- **Validation**: Success criteria (SC-001 through SC-008) will be measured in production.

### ✅ Privacy & Legal Compliance (Principle VI - NON-NEGOTIABLE)
- **Status**: PASS
- **Analysis**: Player discriminators (#1234) MUST be redacted before including in emails via `redactDiscriminator()` utility. No PII in logs (email addresses logged only in secure error logs). Email content respects anonymous reports (reporter identity not included).
- **Implementation**: `redactDiscriminator(playerIdentifier)` called before rendering email template.

---

**Constitution Gates Summary**:
- **Total Principles**: 6
- **Violations**: 0
- **Justified Violations**: 0
- **Unresolvable Violations**: 0

**GATE RESULT**: ✅ **PASS** - Proceed to Phase 0 research

---

**Post-Design Re-Check** (after Phase 1):

All principles re-validated:
- ✅ Components created: 4 email components (IncidentNotificationEmail, EmailButton, EmailHeader, EmailFooter) - minimal and reusable
- ✅ TypeScript interfaces defined for all email props and API responses
- ✅ Tailwind used exclusively in email templates
- ✅ Database changes via migration, RPC functions for all queries
- ✅ No tests created (manual validation only)
- ✅ Discriminator redaction implemented in email sending logic

**GATE RESULT**: ✅ **PASS** - Proceed to Phase 2 implementation

## Project Structure

### Documentation (this feature)

```text
specs/001-email-notifications/
├── spec.md              # Feature specification (COMPLETE)
├── plan.md              # This file - implementation plan (COMPLETE)
├── research.md          # Phase 0 - technology decisions (COMPLETE)
├── data-model.md        # Phase 1 - database schema and entities (COMPLETE)
├── quickstart.md        # Phase 1 - setup and deployment guide (COMPLETE)
├── contracts/           # Phase 1 - API contracts (COMPLETE)
│   ├── cron-send-notifications.md     # Batch email processor spec
│   └── cron-reset-counts.md           # Daily counter reset spec
├── checklists/          # Quality validation
│   └── requirements.md  # Spec quality checklist (COMPLETE)
└── tasks.md             # Phase 2 - NOT created yet (use /speckit.tasks)
```

### Source Code (repository root)

```text
ratlist.gg/
├── app/
│   ├── (app)/                         # Existing authenticated routes
│   ├── (marketing)/                   # Existing public routes
│   └── api/
│       ├── notifications/
│       │   └── toggle/
│       │       └── route.ts           # ✅ EXISTS - preference toggle
│       └── cron/                      # 🆕 NEW DIRECTORY
│           ├── send-notifications/
│           │   └── route.ts           # 🆕 T006 - Batch email processor
│           └── reset-notification-counts/
│               └── route.ts           # 🆕 T007 - Daily counter reset
│
├── components/
│   ├── features/                      # Existing feature components
│   ├── ui/                            # Existing shadcn/ui primitives
│   └── emails/                        # 🆕 NEW DIRECTORY
│       ├── IncidentNotificationEmail.tsx  # 🆕 T005 - Main email template
│       └── components/                # 🆕 T004 - Reusable email UI
│           ├── EmailButton.tsx        # 🆕 CTA button component
│           ├── EmailHeader.tsx        # 🆕 Logo and branding
│           └── EmailFooter.tsx        # 🆕 Unsubscribe links
│
├── lib/
│   ├── supabase/                      # Existing Supabase clients
│   ├── validation/                    # Existing Zod schemas
│   ├── utils/
│   │   └── redact-discriminator.ts    # 🆕 T003 - Privacy utility
│   └── email/                         # 🆕 NEW DIRECTORY
│       ├── resend.ts                  # 🆕 T002 - Resend client instance
│       └── send-notification.ts       # 🆕 Email sending logic (optional helper)
│
├── supabase/
│   ├── migrations/
│   │   ├── 0001_init.sql              # ✅ EXISTS
│   │   ├── 0012_notification_system.sql   # ✅ EXISTS - notification_queue
│   │   ├── 0013_user_profile_updates.sql  # ✅ EXISTS - email_notifications
│   │   └── 0017_email_notification_retry.sql  # 🆕 T001 - Retry columns
│   └── seed/
│       └── seed.sql                   # ✅ EXISTS
│
├── .env.local                         # 🔄 UPDATE - Add email env vars
├── .env.example                       # 🔄 UPDATE - Document email env vars
├── package.json                       # 🔄 UPDATE - Add resend, react-email
└── vercel.json                        # 🆕 T008 - Cron configuration
```

**Legend**:
- ✅ EXISTS - Already in codebase
- 🆕 NEW - Created by this feature
- 🔄 UPDATE - Modified by this feature

**Structure Decision**: 
This is a **web application** (Next.js fullstack) following existing patterns:
- API routes in `app/api/` (new cron routes follow same structure)
- Components separated by purpose (features/, ui/, emails/)
- Utilities in `lib/` with domain-specific subdirectories
- Database changes via sequential migrations in `supabase/migrations/`

**Key Additions**:
1. **`app/api/cron/`** - New directory for scheduled background jobs
2. **`components/emails/`** - React Email templates and reusable email UI components
3. **`lib/email/`** - Email service utilities (Resend client, helpers)
4. **`lib/utils/redact-discriminator.ts`** - Privacy compliance utility for Constitution Principle VI

## Complexity Tracking

> **No violations detected - section included for completeness**

**Constitution Violations**: None

**Technical Debt**: None introduced

**New Components Created**: 4 email components (minimal, all reusable per Principle I)

**Lines of Code Estimate**:
- Database migration: ~50 lines SQL
- Email templates: ~300 lines TSX (4 components)
- Cron endpoints: ~400 lines TS (2 routes + logic)
- Utilities: ~50 lines TS (discriminator redaction, Resend client)
- Configuration: ~20 lines JSON (vercel.json, env updates)
- **Total**: ~820 lines (modest increase for significant feature value)

**Justification for Scope**: All code necessary to deliver FR-001 through FR-015. No gold-plating or speculative features.

---

## Phase Breakdown

### Phase 0: Research & Technology Selection ✅ COMPLETE

**Deliverable**: `research.md` with documented technology decisions

**Decisions Made**:
1. Email service: Resend (free tier adequate, TypeScript SDK, React Email integration)
2. Template engine: React Email (component reusability, Tailwind support)
3. Scheduler: Vercel Cron Jobs (free tier, native to deployment platform)
4. Retry logic: Database-tracked with columns in notification_queue
5. Security: Existing Zod validation + React Email HTML escaping (no additional sanitization)
6. Reset mechanism: Separate cron job at midnight UTC

**No NEEDS CLARIFICATION markers remain** - all unknowns resolved.

---

### Phase 1: Design & Contracts ✅ COMPLETE

**Deliverables**:
- `data-model.md` - Database schema, entity relationships, state machine
- `contracts/cron-send-notifications.md` - Batch processor API spec
- `contracts/cron-reset-counts.md` - Daily reset API spec
- `quickstart.md` - Setup and deployment guide
- `.github/agents/copilot-instructions.md` - Updated agent context

**Database Design**:
- 3 new columns to `notification_queue`: `retry_count`, `last_retry_at`, `permanently_failed`
- 1 new index: `idx_notification_queue_retryable`
- 2 updated RPC functions: `fn_send_pending_notifications()`, `fn_mark_notification_sent()`

**API Contracts**:
- `GET /api/cron/send-notifications` - Batch email processor (every 5 minutes)
- `GET /api/cron/reset-notification-counts` - Daily counter reset (midnight UTC)

**Email Template Design**:
- `IncidentNotificationEmail` - Main template with incident details
- `EmailButton`, `EmailHeader`, `EmailFooter` - Reusable components

**Post-Design Constitution Re-Check**: ✅ PASS (see Constitution Check section above)

---

### Phase 2: Implementation (Use `/speckit.tasks` to generate detailed tasks)

**High-Level Implementation Sequence** (from `quickstart.md`):

#### **T001**: Database Migration
- File: `supabase/migrations/0017_email_notification_retry.sql`
- Add retry tracking columns to notification_queue
- Create index for retryable notifications
- Update RPC functions with retry logic

#### **T002**: Resend Client Setup
- File: `lib/email/resend.ts`
- Initialize Resend SDK with RESEND_API_KEY
- Export typed client instance

#### **T003**: Discriminator Redaction Utility
- File: `lib/utils/redact-discriminator.ts`
- Function to strip #1234 patterns from player identifiers
- Implements Constitution Principle VI (privacy compliance)

#### **T004**: Email UI Components
- Files: `components/emails/components/*.tsx`
- EmailButton - Reusable CTA button with Tailwind styling
- EmailHeader - Logo and branding
- EmailFooter - Unsubscribe/preference links

#### **T005**: Incident Notification Email Template
- File: `components/emails/IncidentNotificationEmail.tsx`
- Main email template with incident details
- Uses React Email components + Tailwind utilities
- Accepts typed props interface from data-model.md

#### **T006**: Send Notifications Cron Endpoint
- File: `app/api/cron/send-notifications/route.ts`
- Implements batch processor contract
- Queries fn_send_pending_notifications()
- Sends emails via Resend with retry logic
- Marks notifications as sent/failed

#### **T007**: Reset Counts Cron Endpoint
- File: `app/api/cron/reset-notification-counts/route.ts`
- Implements daily reset contract
- Calls fn_reset_notification_counts()
- Returns count of users reset

#### **T008**: Vercel Cron Configuration
- File: `vercel.json`
- Schedule T006 every 5 minutes: `*/5 * * * *`
- Schedule T007 daily at midnight UTC: `0 0 * * *`

#### **T009**: Environment Configuration
- Files: `.env.local`, `.env.example`
- Add RESEND_API_KEY, CRON_SECRET, EMAIL_FROM, NEXT_PUBLIC_APP_URL
- Document in .env.example for new developers

#### **T010**: Testing & Validation
- Manual testing: Create test incident, trigger cron, verify email
- Production validation: Deploy, monitor first executions
- Success criteria validation: Track SC-001 through SC-008

**Dependencies Between Tasks**:
- T002, T003, T004 can be done in parallel (no dependencies)
- T005 depends on T004 (uses email components)
- T006 depends on T001, T002, T003, T005 (needs DB, Resend, redaction, template)
- T007 depends on T001 (needs updated RPC function)
- T008 depends on T006, T007 (cron routes must exist)
- T009 can be done anytime (env vars)
- T010 depends on T001-T009 (full feature complete)

**Critical Path**: T001 → T002 → T003 → T004 → T005 → T006 → T008 → T010

**Estimated Effort**: 2-3 days for experienced developer familiar with codebase

---

## Phase 2 Entry Checklist

Before running `/speckit.tasks`, verify:

- ✅ Phase 0 complete: research.md exists with all decisions documented
- ✅ Phase 1 complete: data-model.md, contracts/, quickstart.md exist
- ✅ Constitution re-check passed (no violations)
- ✅ All NEEDS CLARIFICATION markers resolved
- ✅ Agent context updated (.github/agents/copilot-instructions.md)
- ✅ Technical approach validated (Resend + React Email + Vercel Cron)

**READY FOR PHASE 2**: ✅ All prerequisites met

---

## Success Metrics (from spec.md)

**After 1 week of production**:

- **SC-001**: Email delivery time < 5 minutes (measure via timestamp diff)
- **SC-002**: Preference toggle response < 2 seconds (already implemented)
- **SC-003**: Delivery rate > 95% (sent / processed from cron logs)
- **SC-004**: No user receives > 5 emails/day (query notification_queue)
- **SC-005**: Failed emails retry automatically (verify retry_count increments)
- **SC-006**: Email open rate > 40% (Resend analytics dashboard)
- **SC-007**: Opt-out rate < 2% (query email_notifications toggles)
- **SC-008**: Batch handles 1000+ notifications (load test or production peak)

**Monitoring Queries** (from data-model.md):
```sql
-- Pending notifications
SELECT COUNT(*) FROM notification_queue WHERE sent = FALSE AND permanently_failed = FALSE;

-- Permanently failed (investigate)
SELECT COUNT(*) FROM notification_queue WHERE permanently_failed = TRUE;

-- Daily volume per user
SELECT user_id, COUNT(*) FROM notification_queue 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id ORDER BY COUNT DESC LIMIT 10;
```

---

## Risk Mitigation

**Risk 1**: Resend free tier exhausted (100 emails/day)
- **Monitor**: Resend dashboard usage graph
- **Mitigation**: Upgrade to paid tier ($20/month for 50k emails)
- **Early Warning**: Alert at 80% daily usage

**Risk 2**: Vercel Cron unreliable
- **Monitor**: Cron execution logs in Vercel dashboard
- **Mitigation**: Manual cron trigger endpoint available for failover
- **Detection**: Alert if no successful execution in 15 minutes

**Risk 3**: Email deliverability issues (spam folders)
- **Monitor**: Resend bounce rate and open rate analytics
- **Mitigation**: Verify SPF/DKIM records (Resend auto-configures)
- **Target**: Open rate > 40% per SC-006

**Risk 4**: Queue backlog growth
- **Monitor**: Pending notification count query
- **Mitigation**: Increase batch frequency from 5min to 2min if needed
- **Alert Threshold**: >500 pending notifications

---

## Next Steps

1. **Review this plan** with stakeholders/team
2. **Run `/speckit.tasks`** to generate detailed task breakdown with subtasks
3. **Begin implementation** starting with T001 (database migration)
4. **Deploy incrementally**: Test each component before proceeding to next
5. **Monitor production**: Track success criteria after 1 week live

**Estimated Timeline**: 2-3 days development + 1 week production validation

---

## References

- **Specification**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Quickstart**: [quickstart.md](./quickstart.md)
- **Contracts**: [contracts/](./contracts/)
- **Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)
- **Resend Docs**: https://resend.com/docs
- **React Email Docs**: https://react.email/docs
- **Vercel Cron Docs**: https://vercel.com/docs/cron-jobs

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
