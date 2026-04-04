import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { notifyAdminsOfNewUser } from '@/lib/email/sendAdminNotification';

function verifyCronSecret(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: alerts } = await supabase
    .from('admin_alert_queue')
    .select('*')
    .eq('sent', false)
    .order('created_at', { ascending: true })
    .limit(50);

  if (!alerts?.length) return NextResponse.json({ success: true, processed: 0 });

  let processed = 0;
  for (const alert of alerts) {
    try {
      if (alert.event_type === 'new_user') {
        // Get email from auth using admin client
        const { data: authUser } = await supabase.auth.admin.getUserById(alert.payload.user_id);
        await notifyAdminsOfNewUser({
          newUserDisplayName: alert.payload.display_name || 'Unknown',
          newUserEmail: authUser?.user?.email || '',
          registeredAt: alert.payload.created_at,
        });
      }
      await supabase.from('admin_alert_queue').update({ sent: true }).eq('id', alert.id);
      processed++;
    } catch (e) {
      console.error('Failed to process alert:', alert.id, e);
    }
  }

  return NextResponse.json({ success: true, processed });
}
