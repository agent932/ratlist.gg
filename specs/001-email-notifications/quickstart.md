# Quickstart: Email Notifications Implementation

**Feature**: 001-email-notifications  
**Branch**: `001-email-notifications`  
**Created**: December 7, 2025

---

## Overview

This feature adds email notifications to alert users when incidents are reported against their linked players. Notifications are queued in the database, processed in batches every 5 minutes, and sent via Resend email service.

**Key Components**:
- Email service integration (Resend)
- React Email templates
- Batch processor cron job (every 5 minutes)
- Daily counter reset cron job (midnight UTC)
- Enhanced retry logic with exponential backoff

---

## Prerequisites

- ✅ Database tables already exist (migrations 0012, 0013)
- ✅ Notification toggle UI already exists (`/api/notifications/toggle`)
- ✅ Player linking feature implemented
- ✅ Trigger function to queue notifications already exists

**What's Missing**:
- Email service integration
- Email templates
- Cron job implementations
- Retry logic database columns

---

## Quick Setup (5 Steps)

### 1. Install Dependencies

```bash
npm install resend@^3.2.0 @react-email/components@^0.0.15 react-email@^2.1.0
```

### 2. Set Environment Variables

Add to `.env.local`:

```env
# Resend API Key (get from https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Cron job security token (generate random 32+ char string)
CRON_SECRET=$(openssl rand -base64 32)

# Email sender configuration
EMAIL_FROM=notifications@ratlist.gg

# App base URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Add to Vercel environment variables (production):
- `RESEND_API_KEY`
- `CRON_SECRET`
- `EMAIL_FROM`
- `NEXT_PUBLIC_APP_URL` (e.g., https://ratlist.gg)

### 3. Run Database Migration

Create and run migration `0017_email_notification_retry.sql`:

```bash
# Create migration file
touch supabase/migrations/0017_email_notification_retry.sql
```

Copy contents from `data-model.md` → Database Schema Changes section.

Apply migration in Supabase dashboard or via CLI:

```bash
supabase db push
```

### 4. Configure Vercel Cron

Create or update `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-notifications",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/reset-notification-counts",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 5. Deploy to Vercel

```bash
git add .
git commit -m "feat: email notifications"
git push origin 001-email-notifications
```

Deploy via Vercel dashboard or:

```bash
vercel --prod
```

---

## File Structure

```
ratlist.gg/
├── app/
│   └── api/
│       └── cron/
│           ├── send-notifications/
│           │   └── route.ts          # NEW: Batch email processor
│           └── reset-notification-counts/
│               └── route.ts          # NEW: Daily counter reset
│
├── components/
│   └── emails/
│       ├── IncidentNotificationEmail.tsx  # NEW: Email template
│       └── components/                    # NEW: Email UI components
│           ├── EmailButton.tsx
│           ├── EmailHeader.tsx
│           └── EmailFooter.tsx
│
├── lib/
│   ├── email/
│   │   ├── resend.ts              # NEW: Resend client instance
│   │   └── send-notification.ts   # NEW: Email sending logic
│   └── utils/
│       └── redact-discriminator.ts # NEW: Privacy utility
│
├── supabase/
│   └── migrations/
│       └── 0017_email_notification_retry.sql  # NEW: Retry columns
│
├── .env.local                     # UPDATED: Add email env vars
└── vercel.json                    # NEW: Cron configuration
```

---

## Implementation Order

### Phase 1: Foundation (No Email Sending Yet)

**T001**: Database migration for retry logic
- File: `supabase/migrations/0017_email_notification_retry.sql`
- Add columns: `retry_count`, `last_retry_at`, `permanently_failed`
- Add index: `idx_notification_queue_retryable`
- Update functions: `fn_send_pending_notifications()`, `fn_mark_notification_sent()`

**T002**: Resend client setup
- File: `lib/email/resend.ts`
- Initialize Resend SDK with API key
- Export typed client instance

**T003**: Discriminator redaction utility
- File: `lib/utils/redact-discriminator.ts`
- Function: `redactDiscriminator(identifier: string): string`
- Strips `#1234` patterns from player identifiers per Constitution Principle VI

### Phase 2: Email Templates

**T004**: Base email components
- Files: `components/emails/components/*.tsx`
- `EmailButton` - Call-to-action button
- `EmailHeader` - Logo and branding
- `EmailFooter` - Unsubscribe links

**T005**: Incident notification email template
- File: `components/emails/IncidentNotificationEmail.tsx`
- Props interface from `data-model.md`
- Uses React Email components + Tailwind
- Includes all incident details + dashboard link

### Phase 3: Cron Jobs

**T006**: Send notifications cron endpoint
- File: `app/api/cron/send-notifications/route.ts`
- Implements contract from `contracts/cron-send-notifications.md`
- Queries pending notifications
- Sends via Resend
- Handles retries and failures
- Returns summary stats

**T007**: Reset counts cron endpoint
- File: `app/api/cron/reset-notification-counts/route.ts`
- Implements contract from `contracts/cron-reset-counts.md`
- Calls `fn_reset_notification_counts()`
- Returns count of users reset

**T008**: Vercel cron configuration
- File: `vercel.json`
- Schedule T006 every 5 minutes
- Schedule T007 daily at midnight UTC

### Phase 4: Testing & Validation

**T009**: Manual testing
- Create test incident against linked player
- Verify notification queued in database
- Manually trigger cron endpoint
- Verify email received
- Check retry logic on simulated failure

**T010**: Production deployment
- Deploy to Vercel
- Monitor cron execution logs
- Verify first real notification sent
- Check Resend dashboard for delivery stats

---

## Testing Checklist

### Local Testing

- [ ] Install dependencies successfully
- [ ] Environment variables configured
- [ ] Database migration applied
- [ ] Email template renders correctly (use `npm run email dev`)
- [ ] Cron endpoint returns 401 without CRON_SECRET
- [ ] Cron endpoint returns 200 with valid CRON_SECRET
- [ ] Email sent successfully via manual cron trigger
- [ ] Notification marked as sent in database
- [ ] Discriminator redacted in email content

### Production Testing

- [ ] Vercel environment variables set
- [ ] Vercel cron jobs configured in dashboard
- [ ] First cron execution successful (check logs)
- [ ] Email delivered to real user
- [ ] Dashboard link works correctly
- [ ] Email renders correctly in Gmail, Outlook, Apple Mail
- [ ] Retry logic works on simulated failure
- [ ] Daily counter reset executes at midnight UTC

---

## Monitoring

### Key Metrics

1. **Delivery Rate**: `sent / processed` (target: >95%)
2. **Permanently Failed Count**: Alert if >5
3. **Queue Depth**: Alert if >500 pending notifications
4. **Execution Time**: Alert if >20s (approaching timeout)
5. **Email Open Rate**: Track via Resend analytics (target: 40%)

### Resend Dashboard

Monitor at https://resend.com/emails:
- Delivery status
- Bounce rate
- Open rate (if tracking enabled)
- Daily usage vs. limits

### Database Queries

```sql
-- Pending notifications
SELECT COUNT(*) FROM notification_queue 
WHERE sent = FALSE AND permanently_failed = FALSE;

-- Permanently failed (needs investigation)
SELECT * FROM notification_queue 
WHERE permanently_failed = TRUE
ORDER BY created_at DESC;

-- Today's notification volume
SELECT user_id, COUNT(*) as count
FROM notification_queue
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id
ORDER BY count DESC
LIMIT 20;
```

---

## Troubleshooting

### Issue: Emails not being sent

**Check**:
1. Cron job running? (Vercel dashboard → Deployments → Functions)
2. CRON_SECRET environment variable set?
3. RESEND_API_KEY valid? (check Resend dashboard)
4. Notifications in queue? (query `notification_queue` table)
5. User has `email_notifications = true`?
6. User has valid email in `auth.users`?

### Issue: Emails going to spam

**Fix**:
1. Verify SPF/DKIM records (Resend auto-configures these)
2. Add domain verification in Resend dashboard
3. Check email content for spam trigger words
4. Ensure `EMAIL_FROM` uses verified domain

### Issue: Queue growing large

**Causes**:
- Resend API down (check status.resend.com)
- Rate limit hit (upgrade Resend plan)
- Cron job not executing (check Vercel logs)

**Fix**:
- Manually trigger cron endpoint to process backlog
- Increase batch size if needed (edit `LIMIT 100` in RPC function)

---

## Scaling Considerations

### Free Tier Limits

- **Resend**: 100 emails/day, 3,000/month
- **Vercel Cron**: Unlimited on Hobby plan
- **Supabase**: 500MB database (plenty for notification queue)

### When to Upgrade

- **>100 emails/day**: Upgrade Resend to $20/month (50k emails)
- **>1000 pending notifications**: Increase batch size or frequency
- **>25s execution time**: Optimize query or reduce batch size

### Future Optimizations

- Digest emails (weekly summary instead of per-incident)
- Category filtering (notify only for specific incident types)
- Notification history UI (let users review past emails)

---

## Next Steps After Deployment

1. **Monitor first week**: Track delivery rates, open rates, user opt-outs
2. **Adjust rate limits**: If 5/day too restrictive, increase to 10/day
3. **Gather feedback**: Survey users on notification usefulness
4. **Document FAQ**: Add "How do I manage notifications?" to help docs
5. **Plan improvements**: Based on SC-007 (opt-out rate), iterate on content

---

## Success Criteria Validation

After 1 week of production:

- ✅ **SC-001**: Check average delivery time (should be <5 minutes)
- ✅ **SC-003**: Calculate delivery rate (should be >95%)
- ✅ **SC-004**: Verify no user received >5 emails in 24 hours
- ✅ **SC-006**: Check Resend analytics for open rate (target: 40%)
- ✅ **SC-007**: Calculate opt-out rate (should be <2%)
- ✅ **SC-008**: Verify batch processor handles peak load without timeout

---

## Support Resources

- **Resend Docs**: https://resend.com/docs
- **React Email Docs**: https://react.email/docs
- **Vercel Cron Docs**: https://vercel.com/docs/cron-jobs
- **Supabase RPC Docs**: https://supabase.com/docs/guides/database/functions

---

**Ready to implement?** Start with Phase 1 (T001-T003) and verify database migration works before proceeding to email templates.
