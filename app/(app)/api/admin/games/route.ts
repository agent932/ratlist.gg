import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import { createSupabaseAdmin } from '@/lib/supabase/server'
import { z } from 'zod'

const gameSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
})

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const parsed = gameSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('games')
      .insert({ name: parsed.data.name, slug: parsed.data.slug })
      .select('id, name, slug')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A game with that slug already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to create game' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message === 'Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
