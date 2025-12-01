// T012: User flags API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = createSupabaseServer();
    const { searchParams } = new URL(request.url);

    const resolution = searchParams.get('resolution') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Validate resolution filter
    const validResolutions = ['all', 'open', 'approved', 'dismissed'];
    const resolutionFilter = validResolutions.includes(resolution) ? resolution : 'all';

    // Call the database function to get user flags
    const { data, error } = await supabase.rpc('fn_get_user_flags', {
      target_user_id: user.id,
      resolution_filter: resolutionFilter,
      limit_count: limit,
      offset_count: offset,
    });

    if (error) {
      console.error('Error fetching user flags:', error);
      return NextResponse.json(
        { error: 'Failed to fetch flags' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('flags')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return NextResponse.json({
      flags: data || [],
      total_count: count || 0,
      has_more: (offset + limit) < (count || 0),
      page,
      limit,
    });
  } catch (error) {
    console.error('User flags API error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
