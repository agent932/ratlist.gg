import { NextRequest, NextResponse } from 'next/server';
import { requireModerator, getCurrentUserWithRole } from '@/lib/auth/guards';
import { createSupabaseServer } from '@/lib/supabase/server';
import { z } from 'zod';

const prefsSchema = z.object({
  notify_new_flag: z.boolean().optional(),
  notify_flag_resolved: z.boolean().optional(),
  notify_new_user: z.boolean().optional(),
  notify_user_suspended: z.boolean().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireModerator();

    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from('admin_notification_prefs')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!data) {
      // Upsert defaults
      const { data: newRow } = await supabase
        .from('admin_notification_prefs')
        .upsert({ user_id: user.id })
        .select('*')
        .single();
      return NextResponse.json(newRow);
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireModerator();
    const user = await getCurrentUserWithRole();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = prefsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from('admin_notification_prefs')
      .upsert({ user_id: user.id, ...parsed.data, updated_at: new Date().toISOString() })
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: 'Failed to update prefs' }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
