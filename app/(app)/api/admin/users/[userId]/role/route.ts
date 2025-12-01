// M005: Admin API for role assignment
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getCurrentUserWithRole } from '@/lib/auth/guards';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';

const roleSchema = z.object({
  role: z.enum(['user', 'moderator', 'admin']),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Require admin access and get current user
    await requireAdmin();
    const user = await getCurrentUserWithRole();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const userId = params.userId;
    const body = await request.json();
    
    // Validate input
    const { role } = roleSchema.parse(body);
    
    // Prevent self-demotion: Admins cannot demote themselves
    if (user.id === userId && user.role === 'admin' && role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot demote yourself from admin role' },
        { status: 403 }
      );
    }

    // Use admin client to update role
    const supabase = createSupabaseAdmin();
    
    // Get current role before updating
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Add audit logging for role changes
    await supabase.from('moderation_logs').insert({
      moderator_id: user.id,
      action: 'role_change',
      target_user_id: userId,
      details: {
        old_role: currentProfile?.role || 'unknown',
        new_role: role,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: data.user_id,
        role: data.role,
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

    console.error('Error in role assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
