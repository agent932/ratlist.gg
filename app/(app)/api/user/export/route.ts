// M037: User data export endpoint (GDPR compliance)
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const supabase = createSupabaseServer();

    // Fetch user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Fetch user's incidents
    const { data: incidents } = await supabase
      .from('incidents')
      .select(`
        *,
        game:games(name, slug),
        category:incident_categories(label, slug),
        player:players!incidents_reported_player_id_fkey(identifier, display_name)
      `)
      .eq('reporter_user_id', user.id);

    // Fetch user's flags
    const { data: flags } = await supabase
      .from('flags')
      .select(`
        *,
        incident:incidents(
          description,
          game:games(name),
          player:players!incidents_reported_player_id_fkey(identifier)
        )
      `)
      .eq('flagger_user_id', user.id);

    // Build export data
    const exportData = {
      exportDate: new Date().toISOString(),
      userId: user.id,
      email: user.email,
      profile: {
        displayName: profile?.display_name || null,
        role: profile?.role || 'user',
        createdAt: profile?.created_at,
        suspended: profile?.suspended_until || null,
      },
      incidents: incidents || [],
      flags: flags || [],
      stats: {
        totalIncidents: incidents?.length || 0,
        totalFlags: flags?.length || 0,
      },
    };

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="ratlist-data-export-${user.id}.json"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    console.error('Error in data export:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
