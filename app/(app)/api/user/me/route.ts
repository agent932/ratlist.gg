// Get current user's profile
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { createSupabaseServer } from '@/lib/supabase/server';
import { rateLimit, rateLimitedResponse, authenticatedRateLimiter } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const allowed = await rateLimit(request, authenticatedRateLimiter);
  if (!allowed) {
    return rateLimitedResponse();
  }

  try {
    const user = await requireAuth();
    const supabase = createSupabaseServer();

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

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
