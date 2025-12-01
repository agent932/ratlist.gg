import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling, badRequest, unauthorized } from '../../../../lib/http'
import { createSupabaseServer, createSupabaseAdmin } from '../../../../lib/supabase/server'
import { IncidentInput } from '../../../../lib/validation/incident'
import { revalidatePath } from 'next/cache'
import { checkRateLimit, recordSubmission } from '../../../../lib/rate-limit'

export const POST = withErrorHandling(async (req: NextRequest) => {
  const supabase = createSupabaseServer()
  const supabaseAdmin = createSupabaseAdmin()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized('Sign in required')

  const rateCheck = checkRateLimit(user.id)
  if (!rateCheck.ok) return badRequest(rateCheck.reason!)

  const body = await req.json()
  const parsed = IncidentInput.safeParse(body)
  if (!parsed.success) return badRequest('Invalid input')

  const { game_id, identifier, category_id, occurred_at, description, region, mode, map, is_anonymous } = parsed.data

  // Upsert player using admin client (bypasses RLS)
  const { data: existingPlayer } = await supabaseAdmin
    .from('players')
    .select('id')
    .eq('game_id', game_id)
    .eq('identifier', identifier)
    .maybeSingle()

  let playerId = existingPlayer?.id
  if (!playerId) {
    const { data: newPlayer, error: playerError } = await supabaseAdmin
      .from('players')
      .insert({ game_id, identifier, display_name: identifier })
      .select('id')
      .single()
    if (playerError || !newPlayer) return badRequest('Failed to create player')
    playerId = newPlayer.id
  }

  // Insert incident
  const { data: incident, error } = await supabase
    .from('incidents')
    .insert({
      game_id,
      reported_player_id: playerId,
      reporter_user_id: user.id,
      category_id,
      occurred_at: occurred_at || null,
      description,
      region: region || null,
      mode: mode || null,
      map: map || null,
      is_anonymous: is_anonymous || false,
    })
    .select('id')
    .single()

  if (error) return badRequest('Failed to submit incident')

  recordSubmission(user.id)

  // Revalidate affected pages
  const { data: gameRow } = await supabase.from('games').select('slug').eq('id', game_id).single()
  if (gameRow) {
    revalidatePath(`/player/${gameRow.slug}/${playerId}`)
    revalidatePath('/browse')
    revalidatePath('/')
  }

  return NextResponse.json({ id: incident.id }, { status: 201 })
})
