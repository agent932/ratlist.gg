import { redirect } from 'next/navigation';
import { requireModerator, getCurrentUserWithRole } from '@/lib/auth/guards';
import { createSupabaseServer } from '@/lib/supabase/server';
import { AdminNotificationSettings } from '@/components/features/admin/AdminNotificationSettings';

export const metadata = { title: 'Notification Settings | Admin' };

export default async function AdminNotificationsPage() {
  try { await requireModerator(); } catch { redirect('/'); }

  const user = await getCurrentUserWithRole();
  const supabase = await createSupabaseServer();

  const { data: prefs } = await supabase
    .from('admin_notification_prefs')
    .select('*')
    .eq('user_id', user!.id)
    .maybeSingle();

  // Upsert if missing
  let currentPrefs = prefs;
  if (!currentPrefs) {
    const { data: newPrefs } = await supabase
      .from('admin_notification_prefs')
      .upsert({ user_id: user!.id })
      .select('*')
      .single();
    currentPrefs = newPrefs;
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Notification Settings</h1>
        <p className="text-white/60">Choose which events trigger email notifications for your account</p>
      </div>
      <AdminNotificationSettings initialPrefs={currentPrefs} isAdmin={isAdmin} />
    </div>
  );
}
