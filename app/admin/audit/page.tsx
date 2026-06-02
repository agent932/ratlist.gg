import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/guards'
import { createSupabaseAdmin } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import type { ModerationLog } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Audit Logs | Admin',
  description: 'View moderation action history',
}

interface AuditLogWithModerator extends ModerationLog {
  moderator: { display_name: string | null; role: string } | null
}

const ACTION_OPTIONS = [
  'hide_incident',
  'remove_incident',
  'restore_incident',
  'dismiss_flag',
  'remove_via_flag',
  'warn_reporter',
  'assign_role',
  'suspend_user',
  'unsuspend_user',
]

const actionLabels: Record<string, string> = {
  hide_incident: 'Hide Incident',
  remove_incident: 'Remove Incident',
  restore_incident: 'Restore Incident',
  dismiss_flag: 'Dismiss Flag',
  remove_via_flag: 'Remove via Flag',
  warn_reporter: 'Warn Reporter',
  assign_role: 'Assign Role',
  suspend_user: 'Suspend User',
  unsuspend_user: 'Unsuspend User',
}

const actionColors: Record<string, string> = {
  hide_incident: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  remove_incident: 'bg-red-500/20 text-red-400 border-red-500/30',
  restore_incident: 'bg-green-500/20 text-green-400 border-green-500/30',
  dismiss_flag: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  warn_reporter: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  suspend_user: 'bg-red-500/20 text-red-400 border-red-500/30',
  unsuspend_user: 'bg-green-500/20 text-green-400 border-green-500/30',
}

async function getAuditLogs(
  action?: string,
  from?: string,
  to?: string,
  limit = 100
): Promise<AuditLogWithModerator[]> {
  // Use admin client to bypass RLS — audit logs are admin-only
  const supabase = createSupabaseAdmin()

  let query = supabase
    .from('moderation_logs')
    .select(`*, moderator:user_profiles(display_name, role)`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (action) query = query.eq('action', action)
  if (from) query = query.gte('created_at', new Date(from).toISOString())
  if (to) {
    const toDate = new Date(to)
    toDate.setDate(toDate.getDate() + 1)
    query = query.lt('created_at', toDate.toISOString())
  }

  const { data, error } = await query
  if (error) { console.error('Audit log error:', error); return [] }
  return data || []
}

type Props = { searchParams: Promise<{ action?: string; from?: string; to?: string }> }

export default async function AuditLogsPage({ searchParams }: Props) {
  try {
    await requireAdmin()
  } catch {
    redirect('/')
  }

  const { action, from, to } = await searchParams
  const logs = await getAuditLogs(action, from, to)

  const activeFilters = [action, from, to].filter(Boolean).length

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Audit Logs</h1>
        <p className="text-white/60">Complete history of moderation actions</p>
      </div>

      {/* Filters */}
      <Card className="p-4 border-white/10 bg-white/5 mb-6">
        <form method="GET" className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/50">Action type</label>
            <select
              name="action"
              defaultValue={action ?? ''}
              className="bg-slate-800 text-white px-3 py-1.5 rounded-lg border border-slate-600 text-sm focus:outline-none focus:border-brand"
            >
              <option value="">All actions</option>
              {ACTION_OPTIONS.map((a) => (
                <option key={a} value={a}>{actionLabels[a]}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/50">From date</label>
            <input
              type="date"
              name="from"
              defaultValue={from ?? ''}
              className="bg-slate-800 text-white px-3 py-1.5 rounded-lg border border-slate-600 text-sm focus:outline-none focus:border-brand"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/50">To date</label>
            <input
              type="date"
              name="to"
              defaultValue={to ?? ''}
              className="bg-slate-800 text-white px-3 py-1.5 rounded-lg border border-slate-600 text-sm focus:outline-none focus:border-brand"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-1.5 bg-brand hover:bg-brand/90 text-brand-foreground rounded-lg text-sm font-medium transition-colors"
            >
              Filter
            </button>
            {activeFilters > 0 && (
              <a
                href="/admin/audit"
                className="px-4 py-1.5 border border-white/20 text-white/60 hover:text-white rounded-lg text-sm transition-colors"
              >
                Clear
              </a>
            )}
          </div>

          <div className="ml-auto text-xs text-white/40 self-center">
            {logs.length} result{logs.length !== 1 ? 's' : ''}
            {activeFilters > 0 && ` (${activeFilters} filter${activeFilters !== 1 ? 's' : ''} active)`}
          </div>
        </form>
      </Card>

      {/* Log entries */}
      {logs.length === 0 ? (
        <Card className="p-8 text-center border-white/10 bg-white/5">
          <p className="text-white/60">No audit logs found</p>
          {activeFilters > 0 && (
            <a href="/admin/audit" className="text-sm text-brand hover:text-brand/80 mt-2 inline-block">
              Clear filters
            </a>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log: AuditLogWithModerator) => (
            <Card key={log.id} className="p-4 border-white/10 bg-white/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${actionColors[log.action] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                      {actionLabels[log.action] || log.action}
                    </span>
                    <span className="text-xs text-white/40">
                      {log.target_type}
                    </span>
                  </div>

                  {log.reason && (
                    <p className="text-sm text-white/80 mb-2">{log.reason}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span>
                      By: {log.moderator?.display_name || 'Unknown'} ({log.moderator?.role || 'unknown'})
                    </span>
                    <span>
                      {new Date(log.created_at).toLocaleString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-white/40 cursor-pointer hover:text-white/60">
                        View metadata
                      </summary>
                      <pre className="text-xs text-white/60 mt-1 bg-black/30 p-2 rounded">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>

                <div className="text-xs text-white/30 font-mono shrink-0">
                  {log.id.substring(0, 8)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
