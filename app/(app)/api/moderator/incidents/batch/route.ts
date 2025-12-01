// M016: Batch moderation endpoint
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getCurrentUserWithRole } from '@/lib/auth/guards';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';

const batchModerationSchema = z.object({
  incidentIds: z.array(z.string().uuid()).min(1).max(50),
  action: z.enum(['hide', 'remove', 'restore']),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(); // Batch operations require admin
    const currentUser = await getCurrentUserWithRole();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { incidentIds, action, reason } = batchModerationSchema.parse(body);

    const statusMap = {
      'hide': 'hidden',
      'remove': 'removed',
      'restore': 'active',
    };

    const status = statusMap[action];

    // Use admin client for batch update
    const supabase = createSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('incidents')
      .update({
        status,
        moderated_by: currentUser.id,
        moderated_at: new Date().toISOString(),
        moderation_reason: reason,
      })
      .in('id', incidentIds)
      .select('id');

    if (error) {
      console.error('Error batch updating incidents:', error);
      return NextResponse.json(
        { error: 'Failed to update incidents' },
        { status: 500 }
      );
    }

    const updatedCount = data?.length || 0;

    // Log each moderation action
    const actionMap = {
      'hidden': 'hide_incident',
      'removed': 'remove_incident',
      'active': 'restore_incident',
    };

    const logEntries = (data || []).map((incident) => ({
      moderator_id: currentUser.id,
      action: actionMap[status as keyof typeof actionMap],
      target_type: 'incident',
      target_id: incident.id,
      reason,
      metadata: { batch: true, total_count: updatedCount },
    }));

    if (logEntries.length > 0) {
      await supabase.from('moderation_logs').insert(logEntries);
    }

    console.log(`Batch ${action}: ${updatedCount} incidents by ${currentUser.email}`);

    return NextResponse.json({
      success: true,
      data: {
        updatedCount,
        action,
        incidentIds: data?.map((i) => i.id) || [],
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in batch moderation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
