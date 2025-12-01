// T004: Link player ID to user account
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/guards';
import { createSupabaseServer } from '@/lib/supabase/server';

const linkPlayerSchema = z.object({
  player_id: z.string().min(1, 'Player ID is required').max(100),
  game_id: z.string().uuid('Invalid game ID'),
});

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();
    
    // Parse and validate request body
    const body = await request.json();
    const { player_id, game_id } = linkPlayerSchema.parse(body);
    
    const supabase = createSupabaseServer();
    
    // Check if player ID is already claimed by another user
    const { data: existingLink, error: checkError } = await supabase
      .from('player_links')
      .select('user_id, user_profiles!inner(display_name)')
      .eq('player_id', player_id)
      .eq('game_id', game_id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing link:', checkError);
      return NextResponse.json(
        { error: 'Failed to check player ownership' },
        { status: 500 }
      );
    }
    
    if (existingLink) {
      // Check if it's the current user's link
      if (existingLink.user_id === user.id) {
        return NextResponse.json(
          { error: 'You have already linked this player ID' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'This player ID is already claimed by another user' },
        { status: 409 }
      );
    }
    
    // Insert the player link
    const { data: newLink, error: insertError } = await supabase
      .from('player_links')
      .insert({
        user_id: user.id,
        player_id,
        game_id,
      })
      .select(`
        id,
        player_id,
        game_id,
        linked_at,
        verified,
        games(name)
      `)
      .single();
    
    if (insertError) {
      console.error('Error creating player link:', insertError);
      return NextResponse.json(
        { error: 'Failed to link player ID' },
        { status: 500 }
      );
    }
    
    const gameName = (newLink.games as any)?.name || 'Unknown';
    
    // Log the action to moderation_logs
    await supabase.from('moderation_logs').insert({
      moderator_id: user.id,
      action: 'link_player',
      target_type: 'player_link',
      target_id: newLink.id,
      metadata: {
        player_id,
        game_id,
        game_name: gameName,
      },
    });
    
    return NextResponse.json({
      success: true,
      link: {
        id: newLink.id,
        player_id: newLink.player_id,
        game_id: newLink.game_id,
        game_name: gameName,
        linked_at: newLink.linked_at,
        verified: newLink.verified,
      },
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
    
    console.error('Unexpected error in link-player:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
