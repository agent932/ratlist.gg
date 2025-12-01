// T004: Dashboard stats API endpoint
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET() {
  try {
    const user = await requireAuth();
    const supabase = createSupabaseServer();

    // Call the database function to get user stats
    const { data, error } = await supabase.rpc('fn_get_user_dashboard_stats', {
      target_user_id: user.id,
    });

    if (error) {
      console.error('Error fetching dashboard stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch dashboard stats' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
