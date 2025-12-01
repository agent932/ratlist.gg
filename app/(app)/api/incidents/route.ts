import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling, badRequest, unauthorized } from '../../../../lib/http'
import { createSupabaseServer, createSupabaseAdmin } from '../../../../lib/supabase/server'
import { IncidentInput } from '../../../../lib/validation/incident'
import { revalidatePath } from 'next/cache'
import { checkRateLimit, recordSubmission, rateLimit, rateLimitedResponse, publicRateLimiter, mutationRateLimiter } from '../../../../lib/rate-limit'

export async function GET(request: NextRequest) {
  // Apply rate limiting to prevent scraping
  const allowed = await rateLimit(request, publicRateLimiter);
  if (!allowed) {
    return rateLimitedResponse();
  }

  const supabase = createSupabaseServer();
  const { searchParams } = new URL(request.url);

  const gameSlug = searchParams.get('game');
  const playerIdentifier = searchParams.get('player');
  const limit = parseInt(searchParams.get('limit') || '50');

  if (!gameSlug || !playerIdentifier) {
    return NextResponse.json(
      { error: 'Missing required parameters: game and player' },
      { status: 400 }
    );
  }

  try {
    // Get game ID from slug
    const { data: game } = await supabase
      .from('games')
      .select('id')
      .eq('slug', gameSlug)
      .single();

    if (!game) {
      return NextResponse.json({ incidents: [] });
    }

    // Get player
    const { data: player } = await supabase
      .from('players')
      .select('id')
      .eq('game_id', game.id)
      .eq('identifier', playerIdentifier)
      .single();

    if (!player) {
      return NextResponse.json({ incidents: [] });
    }

    // Fetch incidents for this player
    const { data: incidents, error } = await supabase
      .from('incidents')
      .select(`
        id,
        description,
        severity,
        status,
        created_at,
        category_id,
        incident_categories (
          name
        )
      `)
      .eq('reported_player_id', player.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching incidents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch incidents' },
        { status: 500 }
      );
    }

    // Format the response
    const formattedIncidents = (incidents || []).map((inc: any) => ({
      id: inc.id,
      description: inc.description,
      severity: inc.severity,
      status: inc.status,
      created_at: inc.created_at,
      category_id: inc.category_id,
      category_name: inc.incident_categories?.name || 'Unknown',
    }));

    return NextResponse.json({ incidents: formattedIncidents });
  } catch (error) {
    console.error('Incidents API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
