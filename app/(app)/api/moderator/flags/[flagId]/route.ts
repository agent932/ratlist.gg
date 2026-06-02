// M008: Flag review API endpoint
import { NextRequest, NextResponse } from 'next/server'
import { requireModerator, getCurrentUserWithRole } from '@/lib/auth/guards'
import {
  createSupabaseServer,
  createSupabaseAdmin,
} from '@/lib/supabase/server'
import { z } from 'zod'

const flagUpdateSchema = z.object({
  status: z.enum(['open', 'closed']),
  resolution: z
    .enum(['dismissed', 'removed_incident', 'warned_reporter'])
    .optional(),
})

// GET: Fetch single flag with full context
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ flagId: string }> }
) {
  const { flagId } = await params
  try {
    await requireModerator()

    const supabase = await createSupabaseServer()

    const { data, error } = await supabase
      .from('flags')
      .select(
        `
        *,
        incident:incidents (
          *,
          game:games (name, slug),
          category:incident_categories (label, slug),
          player:players!incidents_reported_player_id_fkey (identifier, display_name)
        )
      `
      )
      .eq('id', flagId)
      .single()

    if (error) {
      console.error('Error fetching flag:', error)
      return NextResponse.json(
        { error: 'Failed to fetch flag' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ error: 'Flag not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Moderator access required'
    ) {
      return NextResponse.json(
        { error: 'Unauthorized: Moderator access required' },
        { status: 403 }
      )
    }

    console.error('Error in flag GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH: Update flag status/resolution
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ flagId: string }> }
) {
  const { flagId } = await params
  try {
    await requireModerator()
    const currentUser = await getCurrentUserWithRole()

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    const body = await request.json()

    const { status, resolution } = flagUpdateSchema.parse(body)

    // Use admin client for update
    const supabase = createSupabaseAdmin()

    const updateData: Record<string, string> = {
      status,
      reviewed_by: currentUser.id,
      reviewed_at: new Date().toISOString(),
    }

    if (resolution) {
      updateData.resolution = resolution
    }

    const { data, error } = await supabase
      .from('flags')
      .update(updateData)
      .eq('id', flagId)
      .select('id, incident_id, resolution')
      .single()

    if (error) {
      console.error('Error updating flag:', error)
      return NextResponse.json(
        { error: 'Failed to update flag' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ error: 'Flag not found' }, { status: 404 })
    }

    // Map resolution to audit log action
    const actionMap: Record<string, string> = {
      dismissed: 'dismiss_flag',
      removed_incident: 'remove_via_flag',
      warned_reporter: 'warn_reporter',
    }
    const logAction = resolution ? actionMap[resolution] : 'dismiss_flag'

    // Write audit log entry
    await supabase.from('moderation_logs').insert({
      moderator_id: currentUser.id,
      action: logAction,
      target_type: 'flag',
      target_id: flagId,
      metadata: { incident_id: data.incident_id, resolution: data.resolution },
    })

    // If removing via flag, also update the incident status and log that separately
    if (resolution === 'removed_incident' && data.incident_id) {
      await supabase.from('incidents').update({
        status: 'removed',
        moderated_by: currentUser.id,
        moderated_at: new Date().toISOString(),
        moderation_reason: 'Removed via flag review',
      }).eq('id', data.incident_id)

      await supabase.from('moderation_logs').insert({
        moderator_id: currentUser.id,
        action: 'remove_incident',
        target_type: 'incident',
        target_id: data.incident_id,
        reason: 'Removed via flag review',
        metadata: { flag_id: flagId },
      })
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Moderator access required'
    ) {
      return NextResponse.json(
        { error: 'Unauthorized: Moderator access required' },
        { status: 403 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error in flag PATCH:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
