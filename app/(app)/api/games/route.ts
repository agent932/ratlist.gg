// API: Get list of all games
import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createSupabaseServer();

    const { data: games, error } = await supabase
      .from('games')
      .select('id, name, slug')
      .order('name');

    if (error) {
      console.error('Error fetching games:', error);
      return NextResponse.json(
        { error: 'Failed to fetch games' },
        { status: 500 }
      );
    }

    return NextResponse.json({ games });
  } catch (error) {
    console.error('Unexpected error fetching games:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
