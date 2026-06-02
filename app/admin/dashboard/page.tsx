import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/guards'
import { createSupabaseServer } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Sparkline } from '@/components/features/admin/Sparkline'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin Dashboard | Ratlist.gg',
  description: 'Admin overview and moderation tools',
}

interface DailyPoint { date: string; count: number }
interface TopReporter { user_id: string; display_name: string; count: number }
interface TopCategory { category: string; flag_count: number; incident_count: number }

interface AdminTrends {
  daily_incidents: DailyPoint[]
  daily_flags: DailyPoint[]
  top_reporters: TopReporter[]
  top_flagged_categories: TopCategory[]
}

async function getAdminStats() {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase.rpc('fn_get_admin_stats')
  if (error) { console.error('fn_get_admin_stats error:', error); return null }
  return data
}

async function getAdminTrends(): Promise<AdminTrends | null> {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase.rpc('fn_get_admin_trends')
  if (error) { console.error('fn_get_admin_trends error:', error); return null }
  return data as AdminTrends
}

export default async function AdminDashboardPage() {
  try {
    await requireAdmin()
  } catch {
    redirect('/')
  }

  const [stats, trends] = await Promise.all([getAdminStats(), getAdminTrends()])

  const incidentsByGame = (stats?.incidents_by_game_7d ?? {}) as Record<string, number>
  const incidentCounts = (trends?.daily_incidents ?? []).map((d) => d.count)
  const flagCounts = (trends?.daily_flags ?? []).map((d) => d.count)
  const totalIncidents30d = incidentCounts.reduce((a, b) => a + b, 0)
  const totalFlags30d = flagCounts.reduce((a, b) => a + b, 0)

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
            <div className="text-3xl font-bold text-brand">{stats?.open_flags ?? '—'}</div>
            <div className="text-xs text-white/40 mt-2">Click to review</div>
          </Card>
        </Link>

        <Card className="p-6 border-white/10 bg-white/5">
          <div className="text-sm text-white/60 mb-1">Incidents Today</div>
          <div className="text-3xl font-bold text-white">{stats?.incidents_today ?? '—'}</div>
        </Card>

        <Card className="p-6 border-white/10 bg-white/5">
          <div className="text-sm text-white/60 mb-1">New Users Today</div>
          <div className="text-3xl font-bold text-white">{stats?.users_today ?? '—'}</div>
        </Card>

        <Card className="p-6 border-white/10 bg-white/5">
          <div className="text-sm text-white/60 mb-1">Total Incidents</div>
          <div className="text-3xl font-bold text-white">
            {stats?.total_incidents?.toLocaleString() ?? '—'}
          </div>
        </Card>
      </div>

      {/* 30-day Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="p-6 border-white/10 bg-white/5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-sm text-white/60 mb-1">Incidents — Last 30 Days</div>
              <div className="text-2xl font-bold text-white">{totalIncidents30d}</div>
            </div>
            {incidentCounts.length > 0 && (
              <Sparkline data={incidentCounts} color="#a855f7" width={120} height={40} />
            )}
          </div>
          <div className="flex justify-between text-xs text-white/30">
            <span>30d ago</span>
            <span>today</span>
          </div>
        </Card>

        <Card className="p-6 border-white/10 bg-white/5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-sm text-white/60 mb-1">Flags — Last 30 Days</div>
              <div className="text-2xl font-bold text-white">{totalFlags30d}</div>
            </div>
            {flagCounts.length > 0 && (
              <Sparkline data={flagCounts} color="#f97316" width={120} height={40} />
            )}
          </div>
          <div className="flex justify-between text-xs text-white/30">
            <span>30d ago</span>
            <span>today</span>
          </div>
        </Card>
      </div>

      {/* Top Reporters + Most Flagged Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="p-6 border-white/10 bg-white/5">
          <h2 className="text-lg font-semibold text-white mb-4">Top Reporters <span className="text-sm font-normal text-white/40">(last 30d)</span></h2>
          {!trends?.top_reporters?.length ? (
            <p className="text-white/40 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {trends.top_reporters.map((r, i) => (
                <div key={r.user_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/30 w-4">{i + 1}</span>
                    <span className="text-sm text-white/80">{r.display_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-white/10 rounded-full h-1.5">
                      <div
                        className="bg-brand rounded-full h-1.5"
                        style={{ width: `${(r.count / trends.top_reporters[0].count) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono text-white/60 w-6 text-right">{r.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 border-white/10 bg-white/5">
          <h2 className="text-lg font-semibold text-white mb-4">Most Flagged Categories <span className="text-sm font-normal text-white/40">(last 30d)</span></h2>
          {!trends?.top_flagged_categories?.length ? (
            <p className="text-white/40 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {trends.top_flagged_categories.map((c, i) => (
                <div key={c.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/30 w-4">{i + 1}</span>
                    <span className="text-sm text-white/80">{c.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-white/10 rounded-full h-1.5">
                      <div
                        className="bg-orange-500 rounded-full h-1.5"
                        style={{ width: `${(c.flag_count / trends.top_flagged_categories[0].flag_count) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono text-white/60 w-6 text-right">{c.flag_count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Incidents by Game (Last 7 Days) */}
      <Card className="p-6 border-white/10 bg-white/5 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Incidents by Game <span className="text-sm font-normal text-white/40">(last 7d)</span>
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
                    <span className="text-white/60 font-mono text-sm w-12 text-right">{count}</span>
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
  )
}
