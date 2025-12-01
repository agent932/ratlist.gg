import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { getCurrentUserWithRole } from '@/lib/auth/guards';
import { rateLimit, rateLimitedResponse, publicRateLimiter } from '@/lib/rate-limit';
import type { LinkedPlayer } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  // Apply rate limiting to prevent user enumeration
  const allowed = await rateLimit(request, publicRateLimiter);
  if (!allowed) {
    return rateLimitedResponse();
  }

  try {
    const { username } = params;
    const supabase = createSupabaseServer();
    
    // Get current user (if logged in)
    const currentUser = await getCurrentUserWithRole();
    
    // Fetch user profile by display_name
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, role, created_at, suspended_until, suspension_reason')
      .eq('display_name', username)
      .single();
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if current user is the profile owner or admin
    const isOwner = currentUser?.id === profile.user_id;
    const isAdmin = currentUser?.role === 'admin';
    
    // Fetch linked players
    const { data: linkedPlayers } = await supabase.rpc('fn_get_linked_players', {
      target_user_id: profile.user_id,
    });
    
    // Calculate aggregate stats
    const totalIncidents = linkedPlayers?.reduce(
      (sum: number, player: LinkedPlayer) => sum + (player.incident_count || 0),
      0
    ) || 0;
    
    // Build response with public data
    interface UserProfileResponse {
      display_name: string | null;
      role: string;
      joined_at: string;
      linked_players: LinkedPlayer[];
      stats: {
        total_linked_players: number;
        total_incidents: number;
      };
      private?: {
        email?: string;
        email_notifications: boolean;
        last_notification_sent?: string | null;
      };
      admin?: {
        user_id: string;
        suspended_until: string | null;
        suspension_reason: string | null;
        is_suspended: boolean;
      };
    }

    const responseData: UserProfileResponse = {
      display_name: profile.display_name,
      role: profile.role,
      joined_at: profile.created_at,
      linked_players: linkedPlayers || [],
      stats: {
        total_linked_players: linkedPlayers?.length || 0,
        total_incidents: totalIncidents,
      },
    };
    
    // Add private data if owner
    if (isOwner) {
      // Fetch email from auth.users
      const { data: authUser } = await supabase.auth.getUser();
      
      const { data: privateData } = await supabase
        .from('user_profiles')
        .select('email_notifications, last_notification_sent')
        .eq('user_id', profile.user_id)
        .single();
      
      responseData.private = {
        email: authUser?.user?.email,
        email_notifications: privateData?.email_notifications ?? true,
        last_notification_sent: privateData?.last_notification_sent,
      };
    }
    
    // Add admin data if admin
    if (isAdmin) {
      responseData.admin = {
        user_id: profile.user_id,
        suspended_until: profile.suspended_until,
        suspension_reason: profile.suspension_reason,
        is_suspended: profile.suspended_until && new Date(profile.suspended_until) > new Date(),
      };
    }
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
