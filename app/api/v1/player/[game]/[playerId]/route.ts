import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { tierFromScore } from '@/lib/reputation'
import { formatPlayerName } from '@/lib/utils/player'
import { rateLimit, rateLimitedResponse, publicRateLimiter } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/player/:game/:playerId
 *
 * Public read-only endpoint for querying player reputation.
 * Intended for Discord bots, browser overlays, and third-party integrations.
 *
 * Rate limited: 10 requests / 10 seconds per IP (same as other public endpoints).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ game: string; playerId: string }> }
) {
  const allowed = await rateLimit(request, publicRateLimiter)
  if (!allowed) return rateLimitedResponse()

  const { game: gameSlug, playerId } = await params
  const decodedPlayerId = decodeURIComponent(playerId)

  const supabase = await createSupabaseServer()

  // Resolve game
  const { data: game } = await supabase
    .from('games')
    .select('id, name, slug')
    .eq('slug', gameSlug)
    .single()

  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  }

  // Resolve player (partial match support — strips discriminator)
  const hasDiscriminator = decodedPlayerId.includes('#')
  let playerQuery = supabase
    .from('players')
    .select('id, identifier, display_name')
    .eq('game_id', game.id)

  playerQuery = hasDiscriminator
    ? playerQuery.eq('identifier', decodedPlayerId)
    : playerQuery.like('identifier', `${decodedPlayerId}#%`)

  const { data: player } = await playerQuery.maybeSingle()

  if (!player) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 })
  }

  // Reputation profile
  const { data: rep } = await supabase
    .rpc('fn_get_player_profile', {
      game_slug: gameSlug,
      identifier: player.identifier,
    })
    .maybeSingle()

  const score = (rep as any)?.score ?? 0
  const reportCount = (rep as any)?.report_count ?? 0
  const categoryBreakdown = (rep as any)?.category_counts ?? {}
  const lastIncidentAt = (rep as any)?.last_incident_at ?? null
  const tier = tierFromScore(score)

  return NextResponse.json({
    player: {
      name: formatPlayerName(player.display_name || player.identifier),
      game: game.name,
      game_slug: game.slug,
    },
    reputation: {
      tier,
      score,
      report_count: reportCount,
      last_incident_at: lastIncidentAt,
      category_breakdown: categoryBreakdown,
    },
    meta: {
      profile_url: `https://ratlist.gg/player/${game.slug}/${encodeURIComponent(formatPlayerName(player.identifier))}`,
      api_version: 'v1',
    },
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
    },
  })
}
