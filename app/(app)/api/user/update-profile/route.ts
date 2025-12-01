// Update user profile
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { createSupabaseServer } from '@/lib/supabase/server';
import { z } from 'zod';

const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(50).optional(),
});

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const supabase = createSupabaseServer();
    const body = await request.json();

    const validatedData = updateProfileSchema.parse(body);

    const { error } = await supabase
      .from('user_profiles')
      .update(validatedData)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update profile API error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
