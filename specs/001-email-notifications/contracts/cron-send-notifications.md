# API Contract: Batch Email Processor Cron

**Endpoint**: `GET /api/cron/send-notifications`  
**Purpose**: Process queued email notifications in batches  
**Schedule**: Every 5 minutes via Vercel Cron  
**Runtime**: Edge Function

---

## Request

### HTTP Method
```
GET
```

### Headers
```http
Authorization: Bearer {CRON_SECRET}
```

**Required Headers**:
- `Authorization`: Must match `CRON_SECRET` environment variable for security

### Query Parameters
None

### Request Body
None (GET request)

---

## Response

### Success Response (200 OK)

```typescript
{
  "success": true,
  "processed": number,        // Count of notifications processed
  "sent": number,             // Count successfully sent
  "failed": number,           // Count that failed (will retry)
  "skipped": number,          // Count skipped (user disabled notifications)
  "permanently_failed": number, // Count exceeded max retries
  "execution_time_ms": number,  // Duration of batch processing
  "timestamp": string         // ISO timestamp of execution
}
```

**Example**:
```json
{
  "success": true,
  "processed": 23,
  "sent": 20,
  "failed": 2,
  "skipped": 1,
  "permanently_failed": 0,
  "execution_time_ms": 3420,
  "timestamp": "2025-12-07T15:30:00.000Z"
}
```

### Error Responses

#### 401 Unauthorized
```typescript
{
  "error": "Unauthorized",
  "message": "Invalid or missing CRON_SECRET"
}
```

**When**: Authorization header missing or doesn't match `CRON_SECRET`

#### 500 Internal Server Error
```typescript
{
  "error": "Internal Server Error",
  "message": string,
  "details": {
    "phase": "fetch_notifications" | "send_emails" | "mark_sent",
    "count_processed": number,
    "error_details": string
  }
}
```

**When**: Database query fails, Resend API error, or unexpected exception

---

## Processing Logic

### Pseudocode

```typescript
export async function GET(request: Request) {
  // 1. Verify CRON_SECRET
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Fetch pending notifications (max 100)
  const { data: notifications, error } = await supabase
    .rpc('fn_send_pending_notifications');
  
  if (error) {
    return Response.json({ 
      error: 'Internal Server Error', 
      details: { phase: 'fetch_notifications', error_details: error.message }
    }, { status: 500 });
  }

  let sent = 0, failed = 0, skipped = 0, permanently_failed = 0;

  // 3. Process each notification
  for (const notification of notifications) {
    // Skip if user disabled notifications (checked in query, but double-check)
    if (!notification.user_email) {
      skipped++;
      continue;
    }

    try {
      // 4. Send email via Resend
      const { data: emailResult, error: emailError } = await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: notification.user_email,
        subject: `New Incident Reported: ${notification.category_label}`,
        react: IncidentNotificationEmail({
          userName: notification.user_name,
          userEmail: notification.user_email,
          incidentId: notification.incident_id,
          playerIdentifier: redactDiscriminator(notification.player_identifier),
          gameName: notification.game_name,
          categoryLabel: notification.category_label,
          description: notification.description,
          reportedAt: notification.reported_at,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          incidentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard#incident-${notification.incident_id}`,
          preferencesUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard#preferences`,
        }),
      });

      if (emailError) {
        // 5a. Mark as failed (will retry with backoff)
        await supabase.rpc('fn_mark_notification_sent', {
          notification_id: notification.notification_id,
          success: false,
        });
        
        if (notification.retry_count + 1 >= 3) {
          permanently_failed++;
        } else {
          failed++;
        }
      } else {
        // 5b. Mark as sent
        await supabase.rpc('fn_mark_notification_sent', {
          notification_id: notification.notification_id,
          success: true,
        });
        sent++;
      }
    } catch (error) {
      // Unexpected error - mark as failed
      await supabase.rpc('fn_mark_notification_sent', {
        notification_id: notification.notification_id,
        success: false,
      });
      failed++;
    }
  }

  // 6. Return summary
  return Response.json({
    success: true,
    processed: notifications.length,
    sent,
    failed,
    skipped,
    permanently_failed,
    execution_time_ms: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  });
}
```

### Flow Diagram

```
┌─────────────────────┐
│  Vercel Cron        │
│  (Every 5 minutes)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│  GET /api/cron/send-notif   │
│  Authorization: Bearer XXX  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Verify CRON_SECRET         │
│  (401 if invalid)           │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  fn_send_pending_notif()    │
│  (Get up to 100)            │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  For each notification:     │
│  - Redact discriminator     │
│  - Send via Resend API      │
│  - Mark sent/failed         │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Return summary:            │
│  {sent, failed, skipped}    │
└─────────────────────────────┘
```

---

## Vercel Cron Configuration

**File**: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/send-notifications",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Schedule**: `*/5 * * * *` = Every 5 minutes

**Execution**:
- Vercel automatically adds `Authorization: Bearer {CRON_SECRET}` header
- CRON_SECRET must be set in Vercel environment variables

---

## Rate Limits & Constraints

**Batch Size**: Max 100 notifications per execution (limited by `fn_send_pending_notifications()`)

**Execution Timeout**: 25 seconds (Vercel Edge Function limit)
- Estimated time per email: ~200ms (Resend API call + database update)
- Max emails per batch: ~100 (5-10 seconds of actual processing time)

**Resend Rate Limits**:
- Free tier: 100 emails/day
- No per-minute limit on free tier
- Paid tier ($20/month): 50,000 emails/month, 1000/hour burst

**Database Query Performance**:
- Index on `notification_queue(sent, permanently_failed)` ensures fast lookup
- LIMIT 100 prevents large result sets

---

## Error Handling

### Resend API Errors

**Scenario**: `resend.emails.send()` returns error

**Action**:
1. Log error details
2. Call `fn_mark_notification_sent(notification_id, false)`
3. Increment `retry_count` in database
4. If `retry_count >= 3`, set `permanently_failed = true`
5. Return in `failed` or `permanently_failed` count

**Retry Timing**:
- 1st retry: 5 minutes later
- 2nd retry: 15 minutes later (5 * 2^1)
- 3rd retry: 45 minutes later (5 * 2^2)
- After 3rd failure: `permanently_failed = true`, no more retries

### Database Errors

**Scenario**: `supabase.rpc()` fails

**Action**:
1. Log error with context (phase, notification ID)
2. Return 500 error response
3. Do NOT mark notifications as sent/failed (will retry in next batch)

**Recovery**: Next cron run (5 minutes later) will retry entire batch

### Timeout Errors

**Scenario**: Batch processing exceeds 25s Vercel limit

**Action**:
1. Vercel kills execution mid-batch
2. Partially processed notifications remain in queue
3. Next batch picks up unprocessed notifications

**Mitigation**: 100 notification limit ensures batch completes in ~10s

---

## Monitoring & Logging

### Success Logs

```typescript
console.log(`[Cron] Batch processed: ${sent} sent, ${failed} failed, ${skipped} skipped`);
console.log(`[Cron] Execution time: ${execution_time_ms}ms`);
```

### Error Logs

```typescript
console.error(`[Cron] Failed to send notification ${notification_id}:`, error);
console.error(`[Cron] Permanently failed notification ${notification_id} after 3 retries`);
console.error(`[Cron] Database error in phase ${phase}:`, error);
```

### Metrics to Track

- **Sent Rate**: `sent / processed` (target: >95% per SC-003)
- **Permanently Failed**: Count of `permanently_failed = true` (investigate if >5)
- **Execution Time**: Duration per batch (alert if >20s, approaching timeout)
- **Queue Depth**: Pending notifications count (alert if >500, indicates backlog)

---

## Security

### Authentication

**Method**: Bearer token in `Authorization` header

**Token**: `CRON_SECRET` environment variable (random 32+ character string)

**Why**: Vercel Cron automatically includes this header; prevents unauthorized execution

### Authorization

**None required** - cron job has admin-level access to send notifications

**Why**: This is a background system job, not user-initiated

### Rate Limiting

**Not needed** - endpoint only callable by Vercel Cron with valid secret

---

## Testing

### Manual Testing

```bash
# Local development
curl -H "Authorization: Bearer your-local-cron-secret" \
  http://localhost:3000/api/cron/send-notifications
```

### Integration Testing

```typescript
// Create test notification
await supabase.from('notification_queue').insert({
  user_id: testUser.id,
  incident_id: testIncident.id,
});

// Trigger cron endpoint
const response = await fetch('/api/cron/send-notifications', {
  headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET}` },
});

// Verify response
expect(response.status).toBe(200);
const body = await response.json();
expect(body.sent).toBeGreaterThan(0);

// Verify database updated
const { data } = await supabase
  .from('notification_queue')
  .select('sent')
  .eq('id', notificationId)
  .single();
expect(data.sent).toBe(true);
```

---

## Related Endpoints

- `POST /api/notifications/toggle` - User preference toggle (already exists)
- `GET /api/cron/reset-notification-counts` - Daily count reset (see separate contract)

---

## Dependencies

**External Services**:
- Resend API (`resend.emails.send()`)
- Supabase RPC (`fn_send_pending_notifications()`, `fn_mark_notification_sent()`)

**Environment Variables**:
- `CRON_SECRET` - Authentication token
- `EMAIL_FROM` - Sender email address
- `RESEND_API_KEY` - Resend service credentials
- `NEXT_PUBLIC_APP_URL` - Base URL for dashboard links

**npm Packages**:
- `resend` - Email service SDK
- `@react-email/components` - Email template rendering
