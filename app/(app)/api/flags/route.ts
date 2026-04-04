// POST: Create a new flag on an incident
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase/server';
import { rateLimit, rateLimitedResponse, authenticatedRateLimiter } from '@/lib/rate-limit';
import { z } from 'zod';
import { notifyModsOfNewFlag } from '@/lib/email/sendAdminNotification';

const flagSchema = z.object({
  incident_id: z.string().uuid(),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
});

export async function POST(request: NextRequest) {
  const allowed = await rateLimit(request, authenticatedRateLimiter);
  if (!allowed) return rateLimitedResponse();

  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = flagSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
    }
    const { incident_id, reason } = parsed.data;

    const supabase = await createSupabaseServer();

    // Insert flag
    const { data: flag, error } = await supabase
      .from('flags')
      .insert({ incident_id, flagger_user_id: user.id, reason, status: 'open' })
      .select('id')
      .single();

    if (error || !flag) {
      return NextResponse.json({ error: 'Failed to create flag' }, { status: 500 });
    }

    // Fire-and-forget: notify mods with full incident context
    const adminClient = createSupabaseAdmin();
    adminClient
      .from('incidents')
      .select(`description, incident_categories!inner(label), players!inner(identifier), games!inner(name)`)
      .eq('id', incident_id)
      .single()
      .then(({ data: inc }) => {
        if (!inc) return;
        const toObj = <T,>(v: T | T[]): T => Array.isArray(v) ? v[0] : v;
        notifyModsOfNewFlag({
          flagReason: reason,
          incidentDescription: inc.description,
          categoryLabel: (toObj(inc.incident_categories as any) as any).label,
          playerIdentifier: (toObj(inc.players as any) as any).identifier,
          gameName: (toObj(inc.games as any) as any).name,
          flaggedAt: new Date().toISOString(),
        }).catch(console.error);
      })
      .catch(console.error);

    return NextResponse.json({ success: true, data: { id: flag.id } });
  } catch (error) {
    console.error('Flag creation error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
