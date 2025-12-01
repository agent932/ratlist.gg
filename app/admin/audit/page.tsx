// M035: Audit log viewer page
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/guards';
import { createSupabaseServer } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import type { ModerationLog } from '@/lib/types';

export const metadata = {
  title: 'Audit Logs | Admin',
  description: 'View moderation action history',
};

async function getAuditLogs(limit: number = 50) {
  const supabase = createSupabaseServer();
  
  const { data, error } = await supabase
    .from('moderation_logs')
    .select(`
      *,
      moderator:user_profiles!moderation_logs_moderator_id_fkey(display_name, role)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }

  return data || [];
}

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
};

const actionColors: Record<string, string> = {
  hide_incident: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  remove_incident: 'bg-red-500/20 text-red-400 border-red-500/30',
  restore_incident: 'bg-green-500/20 text-green-400 border-green-500/30',
  dismiss_flag: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  suspend_user: 'bg-red-500/20 text-red-400 border-red-500/30',
  unsuspend_user: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default async function AuditLogsPage() {
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/');
  }

  const logs = await getAuditLogs(100);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Audit Logs</h1>
        <p className="text-white/60">Complete history of moderation actions</p>
      </div>

      {logs.length === 0 ? (
        <Card className="p-8 text-center border-white/10 bg-white/5">
          <p className="text-white/60">No audit logs found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log: ModerationLog) => (
            <Card key={log.id} className="p-4 border-white/10 bg-white/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        actionColors[log.action] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                      }`}
                    >
                      {actionLabels[log.action] || log.action}
                    </span>
                    <span className="text-xs text-white/40">
                      Target: {log.target_type}
                    </span>
                  </div>

                  {log.reason && (
                    <p className="text-sm text-white/80 mb-2">{log.reason}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span>
                      By: {log.moderator?.display_name || 'Unknown'} (
                      {log.moderator?.role || 'unknown'})
                    </span>
                    <span>
                      {new Date(log.created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
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

                <div className="text-xs text-white/30 font-mono">
                  {log.id.substring(0, 8)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
