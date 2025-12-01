// M020: User suspension API
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getCurrentUserWithRole } from '@/lib/auth/guards';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';

const suspensionSchema = z.object({
  duration: z.enum(['1hour', '24hours', '7days', '30days', 'permanent']),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

// POST: Suspend user
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await requireAdmin();
    const currentUser = await getCurrentUserWithRole();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const userId = params.userId;
    const body = await request.json();
    
    const { duration, reason } = suspensionSchema.parse(body);
    
    // Prevent self-suspension
    if (currentUser.id === userId) {
      return NextResponse.json(
        { error: 'Cannot suspend yourself' },
        { status: 403 }
      );
    }

    // Calculate suspension end time
    const now = new Date();
    let suspendedUntil: Date;

    switch (duration) {
      case '1hour':
        suspendedUntil = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case '24hours':
        suspendedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case '7days':
        suspendedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        suspendedUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      case 'permanent':
        suspendedUntil = new Date('2099-12-31'); // Far future date
        break;
    }

    const supabase = createSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        suspended_until: suspendedUntil.toISOString(),
        suspension_reason: reason,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error suspending user:', error);
      return NextResponse.json(
        { error: 'Failed to suspend user' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Log suspension action
    await supabase.from('moderation_logs').insert({
      moderator_id: currentUser.id,
      action: 'suspend_user',
      target_type: 'user',
      target_id: userId,
      reason,
      metadata: { duration, suspended_until: suspendedUntil.toISOString() },
    });

    console.log(`User ${userId} suspended until ${suspendedUntil.toISOString()} by ${currentUser.email}`);

    return NextResponse.json({
      success: true,
      data: {
        userId: data.user_id,
        suspendedUntil: data.suspended_until,
        reason: data.suspension_reason,
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

    console.error('Error in user suspension:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Unsuspend user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await requireAdmin();
    const currentUser = await getCurrentUserWithRole();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const userId = params.userId;
    
    // Prevent self-unsuspension (though this would be rare)
    if (currentUser.id === userId) {
      return NextResponse.json(
        { error: 'Cannot unsuspend yourself' },
        { status: 403 }
      );
    }
    
    const supabase = createSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        suspended_until: null,
        suspension_reason: null,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error unsuspending user:', error);
      return NextResponse.json(
        { error: 'Failed to unsuspend user' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Log unsuspension action
    await supabase.from('moderation_logs').insert({
      moderator_id: currentUser.id,
      action: 'unsuspend_user',
      target_type: 'user',
      target_id: userId,
      reason: 'Suspension lifted by admin',
    });

    console.log(`User ${userId} unsuspended by ${currentUser.email}`);

    return NextResponse.json({
      success: true,
      data: {
        userId: data.user_id,
        suspendedUntil: null,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    console.error('Error in user unsuspension:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
