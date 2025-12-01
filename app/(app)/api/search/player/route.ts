import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling, badRequest } from '../../../../../lib/http'
import { createSupabaseServer } from '../../../../../lib/supabase/server'
import { PlayerSearchInput } from '../../../../../lib/validation/search'

export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const game = searchParams.get('game') ?? ''
  const q = searchParams.get('q') ?? ''
  const parsed = PlayerSearchInput.safeParse({ game, q })
  if (!parsed.success) return badRequest('Invalid query')

  const supabase = createSupabaseServer()
  const { data: gameRow } = await supabase.from('games').select('id, slug').eq('slug', game).single()
  if (!gameRow) return NextResponse.json({ results: [] })

  const { data, error } = await supabase
    .from('players')
    .select('id, identifier, display_name')
    .eq('game_id', gameRow.id)
    .ilike('identifier', `%${q}%`)
    .order('identifier', { ascending: true })
    .limit(20)

  if (error) return badRequest('Search failed')

  return NextResponse.json({ results: data ?? [] })
})
