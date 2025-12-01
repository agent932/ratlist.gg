// T005: Unlink player ID from user account
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/guards';
import { createSupabaseServer } from '@/lib/supabase/server';

const unlinkPlayerSchema = z.object({
  player_id: z.string().min(1, 'Player ID is required'),
  game_id: z.string().uuid('Invalid game ID'),
});

export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();
    
    // Parse and validate request body
    const body = await request.json();
    const { player_id, game_id } = unlinkPlayerSchema.parse(body);
    
    const supabase = createSupabaseServer();
    
    // Verify user owns this link
    const { data: existingLink, error: checkError } = await supabase
      .from('player_links')
      .select('id, user_id, games(name)')
      .eq('player_id', player_id)
      .eq('game_id', game_id)
      .single();
    
    if (checkError || !existingLink) {
      return NextResponse.json(
        { error: 'Player link not found' },
        { status: 404 }
      );
    }
    
    // Check ownership (unless admin)
    const { data: isAdmin } = await supabase.rpc('fn_user_has_role', {
      target_role: 'admin',
    });
    
    if (existingLink.user_id !== user.id && !isAdmin) {
      return NextResponse.json(
        { error: 'You can only unlink your own player IDs' },
        { status: 403 }
      );
    }
    
    // Delete the link
    const { error: deleteError } = await supabase
      .from('player_links')
      .delete()
      .eq('id', existingLink.id);
    
    if (deleteError) {
      console.error('Error deleting player link:', deleteError);
      return NextResponse.json(
        { error: 'Failed to unlink player ID' },
        { status: 500 }
      );
    }
    
    const gameName = (existingLink.games as any)?.name || 'Unknown';
    
    // Log the action
    await supabase.from('moderation_logs').insert({
      moderator_id: user.id,
      action: 'unlink_player',
      target_type: 'player_link',
      target_id: existingLink.id,
      metadata: {
        player_id,
        game_id,
        game_name: gameName,
        was_admin_action: isAdmin && existingLink.user_id !== user.id,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Player ID unlinked successfully',
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
    
    console.error('Unexpected error in unlink-player:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
