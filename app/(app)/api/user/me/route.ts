// Get current user's profile
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase/server';
import { rateLimit, rateLimitedResponse, authenticatedRateLimiter } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const allowed = await rateLimit(request, authenticatedRateLimiter);
  if (!allowed) {
    return rateLimitedResponse();
  }

  try {
    const user = await requireAuth();
    const supabase = await createSupabaseServer();

    let { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Self-heal: if profile is missing (trigger may have failed), create it
    if (error?.code === 'PGRST116') {
      const adminClient = createSupabaseAdmin();
      const displayName = user.email?.split('@')[0]?.slice(0, 30) || 'user';
      const { data: newProfile, error: createError } = await adminClient
        .from('user_profiles')
        .insert({ user_id: user.id, display_name: displayName, role: 'user' })
        .select('*')
        .single();

      if (createError) {
        console.error('Error creating missing user profile:', createError);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
      }
      profile = newProfile;
      error = null;
    }

    if (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...profile,
      email: user.email,
    });
  } catch (error) {
    console.error('User profile API error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
