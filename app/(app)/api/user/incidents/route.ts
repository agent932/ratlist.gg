// T010: User incidents API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = createSupabaseServer();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Validate status filter
    const validStatuses = ['all', 'active', 'removed', 'flagged'];
    const statusFilter = validStatuses.includes(status) ? status : 'all';

    // Call the database function to get user incidents
    const { data, error } = await supabase.rpc('fn_get_user_incidents', {
      target_user_id: user.id,
      status_filter: statusFilter,
      limit_count: limit,
      offset_count: offset,
    });

    if (error) {
      console.error('Error fetching user incidents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch incidents' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('incidents')
      .select('*', { count: 'exact', head: true })
      .eq('reporter_user_id', user.id);

    return NextResponse.json({
      incidents: data || [],
      total_count: count || 0,
      has_more: (offset + limit) < (count || 0),
      page,
      limit,
    });
  } catch (error) {
    console.error('User incidents API error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
