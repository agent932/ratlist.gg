import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase/server'
import { rateLimit, rateLimitedResponse, mutationRateLimiter } from '@/lib/rate-limit'
import { z } from 'zod'

const respondSchema = z.object({
  body: z.string().min(10, 'Response must be at least 10 characters').max(500),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ incidentId: string }> }
) {
  const allowed = await rateLimit(request, mutationRateLimiter)
  if (!allowed) return rateLimitedResponse()

  try {
    const user = await requireAuth()
    const { incidentId } = await params

    const body = await request.json()
    const parsed = respondSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
    }

    const adminClient = createSupabaseAdmin()

    // Fetch the incident to get the reported player
    const { data: incident } = await adminClient
      .from('incidents')
      .select('id, status, reported_player_id, games(id, slug)')
      .eq('id', incidentId)
      .single()

    if (!incident || incident.status === 'removed') {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
    }

    // Verify the current user owns the reported player via player_links
    const { data: link } = await adminClient
      .from('player_links')
      .select('id')
      .eq('user_id', user.id)
      .eq('player_id', incident.reported_player_id)
      .maybeSingle()

    if (!link) {
      return NextResponse.json(
        { error: 'You can only respond to incidents filed against your linked players' },
        { status: 403 }
      )
    }

    const supabase = await createSupabaseServer()

    // Insert response (unique constraint enforces one per incident)
    const { data: response, error } = await supabase
      .from('incident_responses')
      .insert({ incident_id: incidentId, user_id: user.id, body: parsed.data.body })
      .select('id, created_at')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'You have already responded to this incident' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: response }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message === 'Authentication required') {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
