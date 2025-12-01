// T015: Toggle email notifications
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/guards';
import { createSupabaseServer } from '@/lib/supabase/server';

const toggleNotificationsSchema = z.object({
  enabled: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();
    
    // Parse and validate request body
    const body = await request.json();
    const { enabled } = toggleNotificationsSchema.parse(body);
    
    const supabase = createSupabaseServer();
    
    // Update notification preference
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ email_notifications: enabled })
      .eq('user_id', user.id);
    
    if (updateError) {
      console.error('Error updating notification preference:', updateError);
      return NextResponse.json(
        { error: 'Failed to update notification settings' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      email_notifications: enabled,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.error('Unexpected error in toggle notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
