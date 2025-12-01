// M013: Incident moderation API
import { NextRequest, NextResponse } from 'next/server';
import { requireModerator, getCurrentUserWithRole } from '@/lib/auth/guards';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';

const incidentModerationSchema = z.object({
  status: z.enum(['active', 'hidden', 'removed']),
  reason: z.string().min(10, 'Reason must be at least 10 characters').optional(),
});

// PATCH: Update incident status (hide/remove/restore)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { incidentId: string } }
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

    const incidentId = params.incidentId;
    const body = await request.json();
    
    const { status, reason } = incidentModerationSchema.parse(body);

    // Require reason for removal
    if (status === 'removed' && !reason) {
      return NextResponse.json(
        { error: 'Reason required for removing incidents' },
        { status: 400 }
      );
    }

    // Use admin client for update
    const supabase = createSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('incidents')
      .update({
        status,
        moderated_by: currentUser.id,
        moderated_at: new Date().toISOString(),
        moderation_reason: reason || null,
      })
      .eq('id', incidentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating incident:', error);
      return NextResponse.json(
        { error: 'Failed to update incident' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    // Log moderation action
    const actionMap = {
      'hidden': 'hide_incident',
      'removed': 'remove_incident',
      'active': 'restore_incident',
    };

    await supabase.from('moderation_logs').insert({
      moderator_id: currentUser.id,
      action: actionMap[status],
      target_type: 'incident',
      target_id: incidentId,
      reason: reason || null,
      metadata: { previous_status: data.status },
    });

    console.log(`Incident ${incidentId} ${status} by ${currentUser.email}`);

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        status: data.status,
        moderated_at: data.moderated_at,
      },
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

    console.error('Error in incident moderation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
