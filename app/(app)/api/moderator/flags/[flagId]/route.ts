// M008: Flag review API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { requireModerator, getCurrentUserWithRole } from '@/lib/auth/guards';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';

const flagUpdateSchema = z.object({
  status: z.enum(['open', 'closed']),
  resolution: z.enum(['dismissed', 'removed_incident', 'warned_reporter']).optional(),
});

// GET: Fetch single flag with full context
export async function GET(
  request: NextRequest,
  { params }: { params: { flagId: string } }
) {
  try {
    await requireModerator();

    const supabase = createSupabaseServer();
    const flagId = params.flagId;

    const { data, error } = await supabase
      .from('flags')
      .select(`
        *,
        incident:incidents (
          *,
          game:games (name, slug),
          category:incident_categories (label, slug),
          player:players!incidents_reported_player_id_fkey (identifier, display_name)
        )
      `)
      .eq('id', flagId)
      .single();

    if (error) {
      console.error('Error fetching flag:', error);
      return NextResponse.json(
        { error: 'Failed to fetch flag' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Flag not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === 'Moderator access required') {
      return NextResponse.json(
        { error: 'Unauthorized: Moderator access required' },
        { status: 403 }
      );
    }

    console.error('Error in flag GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Update flag status/resolution
export async function PATCH(
  request: NextRequest,
  { params }: { params: { flagId: string } }
) {
  try {
    await requireModerator();
    const currentUser = await getCurrentUserWithRole();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const flagId = params.flagId;
    const body = await request.json();
    
    const { status, resolution } = flagUpdateSchema.parse(body);

    // Use admin client for update
    const supabase = createSupabaseAdmin();
    
    const updateData: Record<string, string> = {
      status,
      reviewed_by: currentUser.id,
      reviewed_at: new Date().toISOString(),
    };

    if (resolution) {
      updateData.resolution = resolution;
    }

    const { data, error } = await supabase
      .from('flags')
      .update(updateData)
      .eq('id', flagId)
      .select()
      .single();

    if (error) {
      console.error('Error updating flag:', error);
      return NextResponse.json(
        { error: 'Failed to update flag' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Flag not found' },
        { status: 404 }
      );
    }

    // TODO: Add audit logging
    console.log(`Flag ${flagId} updated by ${currentUser.email}: ${status} - ${resolution || 'no resolution'}`);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Moderator access required') {
      return NextResponse.json(
        { error: 'Unauthorized: Moderator access required' },
        { status: 403 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in flag PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
