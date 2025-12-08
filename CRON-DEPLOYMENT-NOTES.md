# Email Notification Cron Jobs - Deployment Notes

## Vercel Hobby Plan Limitation

Vercel Hobby accounts only support **daily cron jobs** (runs once per day). The original design specified 5-minute intervals for optimal email delivery, but this requires a Pro plan.

## Current Configuration (Hobby Plan)

**vercel.json**:
```json
{
  "crons": [
    {
      "path": "/api/cron/send-notifications",
      "schedule": "0 */1 * * *"  // Every hour (Hobby-compatible)
    },
    {
      "path": "/api/cron/reset-notification-counts",
      "schedule": "0 0 * * *"     // Daily at midnight UTC
    }
  ]
}
```

**Current Schedule**:
- Email batch processor: **Every hour** (instead of every 5 minutes)
- Daily counter reset: **Midnight UTC** (unchanged)

## Impact on User Experience

- **Original**: Emails sent within 5 minutes of incident creation
- **Current**: Emails sent within 1 hour of incident creation
- **Still acceptable**: Most users won't notice the difference for non-urgent notifications

## Alternatives for 5-Minute Delivery

If you need faster email delivery, you have these options:

### Option 1: Upgrade to Vercel Pro ($20/month)
- Change schedule back to `*/5 * * * *` (every 5 minutes)
- Unlimited cron job frequency
- Best option for production with high traffic

### Option 2: Use External Cron Service (Free)
Use a free service like **cron-job.org** or **EasyCron** to trigger your endpoint:

**Setup**:
1. Create a free account at https://cron-job.org
2. Add a new cron job with URL: `https://ratlist.gg/api/cron/send-notifications`
3. Set schedule: Every 5 minutes
4. Add header: `Authorization: Bearer YOUR_CRON_SECRET`

**Pros**:
- Free for reasonable usage
- 5-minute intervals
- No Vercel plan upgrade needed

**Cons**:
- External dependency
- Less integrated with Vercel infrastructure

### Option 3: Trigger on Incident Creation (Event-Driven)
Modify the database trigger to immediately call the API endpoint when an incident is created:

**Supabase Edge Function** (triggered on incident insert):
```typescript
// Immediately trigger email notification endpoint
await fetch('https://ratlist.gg/api/cron/send-notifications', {
  headers: {
    'Authorization': `Bearer ${CRON_SECRET}`
  }
});
```

**Pros**:
- Instant email delivery
- No cron job needed
- Most responsive user experience

**Cons**:
- Requires Supabase Edge Function setup
- More complex architecture

## Recommended Approach

For now, **stick with hourly cron jobs** on Hobby plan. The 1-hour delay is acceptable for most notification use cases. If user feedback indicates faster delivery is needed, upgrade to Vercel Pro or implement Option 3 (event-driven).

## Current Status

✅ Deployed with hourly cron schedule
✅ Compatible with Vercel Hobby plan
✅ All functionality working (just slower delivery)
