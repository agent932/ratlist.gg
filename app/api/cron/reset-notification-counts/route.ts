import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Verify cron secret for security
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.error('CRON_SECRET not configured');
    return false;
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing CRON_SECRET' },
      { status: 401 }
    );
  }

  try {
    // Initialize Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Call reset function
    const { data, error } = await supabase.rpc('fn_reset_notification_counts');

    if (error) {
      console.error('Error resetting notification counts:', error);
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: error.message,
          details: { phase: 'reset_counts', error_details: error.message }
        },
        { status: 500 }
      );
    }

    const usersReset = data?.[0]?.users_reset || 0;
    const executionTime = Date.now() - startTime;

    console.log(`Reset notification counts for ${usersReset} users`);

    return NextResponse.json({
      success: true,
      users_reset: usersReset,
      execution_time_ms: executionTime,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Unexpected error in reset-notification-counts cron:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: { phase: 'unknown', error_details: String(error) }
      },
      { status: 500 }
    );
  }
}
