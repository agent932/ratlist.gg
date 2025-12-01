// M005: Admin API for role assignment
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/guards';
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
    // Require admin access
    await requireAdmin();

    const userId = params.userId;
    const body = await request.json();
    
    // Validate input
    const { role } = roleSchema.parse(body);

    // Use admin client to update role
    const supabase = createSupabaseAdmin();
    
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

    // TODO: Add audit logging
    console.log(`Role changed for user ${userId} to ${role}`);

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
