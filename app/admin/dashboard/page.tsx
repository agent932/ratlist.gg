// M023: Admin dashboard page
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/guards';
import { createSupabaseServer } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Dashboard | Ratlist.gg',
  description: 'Admin overview and moderation tools',
};

async function getAdminStats() {
  const supabase = createSupabaseServer();
  
  const { data, error } = await supabase.rpc('fn_get_admin_stats');

  if (error) {
    console.error('Error fetching admin stats:', error);
    return null;
  }

  return data;
}

export default async function AdminDashboardPage() {
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/');
  }

  const stats = await getAdminStats();

  if (!stats) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        <Card className="p-8 border-white/10 bg-white/5">
          <p className="text-white/60">Failed to load dashboard stats</p>
        </Card>
      </div>
    );
  }

  const incidentsByGame = stats.incidents_by_game_7d as Record<string, number>;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-white/60">Platform overview and moderation tools</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/moderator/flags">
          <Card className="p-6 border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="text-sm text-white/60 mb-1">Open Flags</div>
            <div className="text-3xl font-bold text-brand">{stats.open_flags}</div>
            <div className="text-xs text-white/40 mt-2">Click to review</div>
          </Card>
        </Link>

        <Card className="p-6 border-white/10 bg-white/5">
          <div className="text-sm text-white/60 mb-1">Incidents Today</div>
          <div className="text-3xl font-bold text-white">{stats.incidents_today}</div>
        </Card>

        <Card className="p-6 border-white/10 bg-white/5">
          <div className="text-sm text-white/60 mb-1">New Users Today</div>
          <div className="text-3xl font-bold text-white">{stats.users_today}</div>
        </Card>

        <Card className="p-6 border-white/10 bg-white/5">
          <div className="text-sm text-white/60 mb-1">Total Incidents</div>
          <div className="text-3xl font-bold text-white">
            {stats.total_incidents.toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Incidents by Game (Last 7 Days) */}
      <Card className="p-6 border-white/10 bg-white/5 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Incidents by Game (Last 7 Days)
        </h2>
        
        {Object.keys(incidentsByGame).length === 0 ? (
          <p className="text-white/60">No incidents in the last 7 days</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(incidentsByGame)
              .sort(([, a], [, b]) => b - a)
              .map(([game, count]) => (
                <div key={game} className="flex items-center justify-between">
                  <span className="text-white/90">{game}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-48 bg-white/10 rounded-full h-2">
                      <div
                        className="bg-brand rounded-full h-2 transition-all"
                        style={{
                          width: `${Math.min((count / Math.max(...Object.values(incidentsByGame))) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-white/60 font-mono text-sm w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/moderator/flags">
          <Card className="p-6 border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">Flag Queue</h3>
            <p className="text-white/60 text-sm">Review flagged content</p>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="p-6 border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">User Management</h3>
            <p className="text-white/60 text-sm">Search and manage users</p>
          </Card>
        </Link>

        <Link href="/admin/audit">
          <Card className="p-6 border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">Audit Logs</h3>
            <p className="text-white/60 text-sm">View moderation history</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
