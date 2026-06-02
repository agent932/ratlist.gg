import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { formatPlayerName } from '@/lib/utils/player'
import { tierFromScore } from '@/lib/reputation'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    const supabase = await createSupabaseServer()

    // Search players matching the query
    const { data, error } = await supabase
      .from('players')
      .select(`
        id,
        identifier,
        display_name,
        game_id,
        games!inner(slug, name)
      `)
      .or(`identifier.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(10)

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json([])
    }

    if (!data || data.length === 0) return NextResponse.json([])

    // Batch-fetch reputation scores for found players
    const playerIds = data.map((p) => p.id)
    const { data: repData } = await supabase
      .from('player_reputation_view')
      .select('player_id, score, report_count')
      .in('player_id', playerIds)

    const repMap = new Map(
      (repData || []).map((r) => [r.player_id, { score: r.score as number, report_count: r.report_count as number }])
    )

    type GameRow = { slug: string; name: string }

    const suggestions = data
      .map((player) => {
        const game = (Array.isArray(player.games) ? player.games[0] : player.games) as GameRow
        const rep = repMap.get(player.id)
        const score = rep?.score ?? 0
        return {
          identifier: formatPlayerName(player.identifier),
          display_name: player.display_name ? formatPlayerName(player.display_name) : null,
          game_slug: game.slug,
          game_name: game.name,
          incident_count: rep?.report_count ?? 0,
          score,
          tier: tierFromScore(score),
        }
      })
      // Sort by most-reported first
      .sort((a, b) => b.incident_count - a.incident_count)

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json([])
  }
}
