# API Contract: Daily Notification Count Reset Cron

**Endpoint**: `GET /api/cron/reset-notification-counts`  
**Purpose**: Reset daily notification counters at midnight UTC  
**Schedule**: Daily at 00:00 UTC via Vercel Cron  
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
  "users_reset": number,         // Count of users whose counters were reset
  "execution_time_ms": number,   // Duration of operation
  "timestamp": string            // ISO timestamp of execution
}
```

**Example**:
```json
{
  "success": true,
  "users_reset": 142,
  "execution_time_ms": 87,
  "timestamp": "2025-12-08T00:00:02.123Z"
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
    "error_details": string
  }
}
```

**When**: Database query fails or unexpected exception

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

  const startTime = Date.now();

  try {
    // 2. Call database function to reset counts
    const { data, error } = await supabase.rpc('fn_reset_notification_counts');
    
    if (error) {
      console.error('[Cron] Failed to reset notification counts:', error);
      return Response.json({
        error: 'Internal Server Error',
        message: 'Failed to reset notification counts',
        details: { error_details: error.message },
      }, { status: 500 });
    }

    // 3. Return success response
    return Response.json({
      success: true,
      users_reset: data?.users_reset || 0,
      execution_time_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Unexpected error resetting counts:', error);
    return Response.json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: { error_details: String(error) },
    }, { status: 500 });
  }
}
```

### Database Function (Already Exists in Migration 0013)

```sql
-- Function: fn_reset_notification_counts
-- Purpose: Reset notification_count_today for all users
-- Returns: Count of users updated

CREATE OR REPLACE FUNCTION public.fn_reset_notification_counts()
RETURNS TABLE (users_reset bigint)
LANGUAGE sql
SECURITY definer
AS $$
  WITH reset_counts AS (
    UPDATE public.user_profiles
    SET notification_count_today = 0
    WHERE notification_count_today > 0
    RETURNING user_id
  )
  SELECT COUNT(*) AS users_reset FROM reset_counts;
$$;
```

**Logic**:
- Updates only users with `notification_count_today > 0` (optimization)
- Returns count of affected rows
- Uses `SECURITY definer` to run with elevated privileges

### Flow Diagram

```
┌─────────────────────┐
│  Vercel Cron        │
│  (Daily at 00:00)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│  GET /api/cron/reset-notif  │
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
│  fn_reset_notification_...  │
│  UPDATE user_profiles       │
│  SET notif_count_today = 0  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Return summary:            │
│  {users_reset: N}           │
└─────────────────────────────┘
```

---

## Vercel Cron Configuration

**File**: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/reset-notification-counts",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Schedule**: `0 0 * * *` = Every day at 00:00 UTC (midnight)

**Execution**:
- Vercel automatically adds `Authorization: Bearer {CRON_SECRET}` header
- CRON_SECRET must be set in Vercel environment variables

---

## Rate Limits & Constraints

**Execution Frequency**: Once per day

**Database Impact**:
- Updates all user_profiles rows where `notification_count_today > 0`
- Worst case: ~1000 users updated (assumes 1000 active users received notifications previous day)
- Execution time: <100ms for 1000 rows

**Vercel Limits**:
- Edge Function timeout: 25 seconds (more than sufficient)
- No rate limiting concerns (once daily execution)

---

## Error Handling

### Database Errors

**Scenario**: `supabase.rpc('fn_reset_notification_counts')` fails

**Action**:
1. Log error details
2. Return 500 error response
3. Do NOT crash - cron will retry next day

**Recovery**: 
- If today's reset fails, tomorrow's reset will still work
- Worst case: Users might not receive notifications for one day if count isn't reset

**Monitoring Alert**: Alert if reset fails 2+ days in a row

### Execution Timeout

**Scenario**: Function exceeds 25s Vercel limit

**Action**: Vercel kills execution

**Likelihood**: Extremely low (function completes in <100ms)

**Mitigation**: None needed - function is simple and fast

---

## Monitoring & Logging

### Success Logs

```typescript
console.log(`[Cron] Reset notification counts for ${users_reset} users`);
console.log(`[Cron] Execution time: ${execution_time_ms}ms`);
```

### Error Logs

```typescript
console.error('[Cron] Failed to reset notification counts:', error);
```

### Metrics to Track

- **Users Reset**: Daily count (expect 10-1000 depending on active users)
- **Execution Time**: Duration (expect <100ms)
- **Failure Rate**: Count of failed resets (alert if >0)

---

## Security

### Authentication

**Method**: Bearer token in `Authorization` header

**Token**: `CRON_SECRET` environment variable (same as send-notifications cron)

**Why**: Prevents unauthorized triggering of reset operation

### Authorization

**None required** - cron job has admin-level access to reset counters

**Why**: This is a background system maintenance job

### Rate Limiting

**Not needed** - endpoint only callable by Vercel Cron with valid secret

---

## Testing

### Manual Testing

```bash
# Local development
curl -H "Authorization: Bearer your-local-cron-secret" \
  http://localhost:3000/api/cron/reset-notification-counts
```

### Integration Testing

```typescript
// Set up test user with non-zero count
await supabase
  .from('user_profiles')
  .update({ notification_count_today: 3 })
  .eq('user_id', testUser.id);

// Trigger cron endpoint
const response = await fetch('/api/cron/reset-notification-counts', {
  headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET}` },
});

// Verify response
expect(response.status).toBe(200);
const body = await response.json();
expect(body.users_reset).toBeGreaterThan(0);

// Verify database updated
const { data } = await supabase
  .from('user_profiles')
  .select('notification_count_today')
  .eq('user_id', testUser.id)
  .single();
expect(data.notification_count_today).toBe(0);
```

---

## Timezone Considerations

**Reset Time**: 00:00 UTC

**User Impact**:
- User in PST (UTC-8): Reset happens at 4:00 PM previous day
- User in EST (UTC-5): Reset happens at 7:00 PM previous day
- User in GMT (UTC+0): Reset happens at midnight
- User in JST (UTC+9): Reset happens at 9:00 AM next day

**Assumption** (from spec): "Midnight UTC reset time is acceptable across all user timezones without confusion"

**Communication**: Document in FAQ/Help that daily limit resets at midnight UTC

---

## Related Endpoints

- `GET /api/cron/send-notifications` - Batch email processor (see separate contract)
- `POST /api/notifications/toggle` - User preference toggle (already exists)

---

## Dependencies

**External Services**:
- Supabase RPC (`fn_reset_notification_counts()`)

**Environment Variables**:
- `CRON_SECRET` - Authentication token

**Database**:
- `user_profiles.notification_count_today` column
