import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { formatPlayerName } from '@/lib/utils/player'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    const supabase = await createSupabaseServer()

    // Search for players matching the query with game information
    const { data, error } = await supabase
      .from('players')
      .select(`
        identifier,
        display_name,
        game_id,
        games!inner(slug, name),
        incidents:incidents(count)
      `)
      .or(`identifier.ilike.%${query}%,display_name.ilike.%${query}%`)
      .order('identifier', { ascending: true })
      .limit(10)

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json([])
    }

    // Transform the data to include incident count and redact identifiers
    // Supabase infers joined relations as arrays; cast to single object (games!inner is always 1:1)
    type RawPlayer = typeof data[number]
    type GameRow = { slug: string; name: string }
    const suggestions = data.map((player: RawPlayer) => {
      const game = (Array.isArray(player.games) ? player.games[0] : player.games) as GameRow
      return {
        identifier: formatPlayerName(player.identifier),
        display_name: player.display_name ? formatPlayerName(player.display_name) : null,
        game_slug: game.slug,
        game_name: game.name,
        incident_count: player.incidents?.[0]?.count || 0,
      }
    })

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json([])
  }
}
