import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling, badRequest } from '../../../../../lib/http'
import { createSupabaseServer } from '../../../../../lib/supabase/server'
import { PlayerSearchInput } from '../../../../../lib/validation/search'
import { rateLimit, rateLimitedResponse, searchRateLimiter } from '../../../../../lib/rate-limit'

export const GET = withErrorHandling(async (req: NextRequest) => {
  // Apply rate limiting
  const allowed = await rateLimit(req, searchRateLimiter);
  if (!allowed) {
    return rateLimitedResponse();
  }

  const { searchParams } = new URL(req.url)
  const game = searchParams.get('game') ?? ''
  const q = searchParams.get('q') ?? ''
  const parsed = PlayerSearchInput.safeParse({ game, q })
  if (!parsed.success) return badRequest('Invalid query')

  const supabase = createSupabaseServer()
  const { data: gameRow } = await supabase.from('games').select('id, slug').eq('slug', game).single()
  if (!gameRow) return NextResponse.json({ results: [] })

  // Use parameterized query to prevent SQL injection
  const { data, error } = await supabase
    .from('players')
    .select('id, identifier, display_name')
    .eq('game_id', gameRow.id)
    .or(`identifier.ilike.%${q.replace(/[%_]/g, '\\$&')}%,display_name.ilike.%${q.replace(/[%_]/g, '\\$&')}%`)
    .order('identifier', { ascending: true })
    .limit(20)

  if (error) return badRequest('Search failed')

  return NextResponse.json({ results: data ?? [] })
})
