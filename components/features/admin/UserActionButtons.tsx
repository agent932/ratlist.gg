'use client';

import { useState } from 'react';

type UserRole = 'user' | 'moderator' | 'admin';
type SuspendDuration = '1hour' | '24hours' | '7days' | '30days' | 'permanent';

type Props = {
  userId: string;
  currentRole: UserRole;
  isSuspended: boolean;
  suspendedUntil: string | null;
  isSelf: boolean;
};

const DURATION_LABELS: Record<SuspendDuration, string> = {
  '1hour': '1 Hour',
  '24hours': '24 Hours',
  '7days': '7 Days',
  '30days': '30 Days',
  'permanent': 'Permanent',
};

export function UserActionButtons({ userId, currentRole, isSuspended, isSelf }: Props) {
  const [role, setRole] = useState<UserRole>(currentRole);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState('');

  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [duration, setDuration] = useState<SuspendDuration>('24hours');
  const [reason, setReason] = useState('');
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [suspendError, setSuspendError] = useState('');

  if (isSelf) return null;

  async function handleRoleChange() {
    if (role === currentRole) return;
    setRoleLoading(true);
    setRoleError('');
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRoleError(data.error || 'Failed to update role');
      } else {
        window.location.reload();
      }
    } catch {
      setRoleError('Network error');
    } finally {
      setRoleLoading(false);
    }
  }

  async function handleSuspend() {
    if (reason.trim().length < 10) {
      setSuspendError('Reason must be at least 10 characters');
      return;
    }
    setSuspendLoading(true);
    setSuspendError('');
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSuspendError(data.error || 'Failed to suspend user');
      } else {
        window.location.reload();
      }
    } catch {
      setSuspendError('Network error');
    } finally {
      setSuspendLoading(false);
    }
  }

  async function handleUnsuspend() {
    setSuspendLoading(true);
    setSuspendError('');
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setSuspendError(data.error || 'Failed to unsuspend user');
      } else {
        window.location.reload();
      }
    } catch {
      setSuspendError('Network error');
    } finally {
      setSuspendLoading(false);
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
      {/* Role Change */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-white/50 w-16 shrink-0">Role</span>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value as UserRole); setRoleError(''); }}
          disabled={roleLoading}
          className="px-2 py-1 text-sm bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-50"
        >
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={handleRoleChange}
          disabled={roleLoading || role === currentRole}
          className="px-3 py-1 text-sm bg-brand hover:bg-brand/90 text-brand-foreground rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {roleLoading ? 'Saving…' : 'Save Role'}
        </button>
        {roleError && <span className="text-xs text-red-400">{roleError}</span>}
      </div>

      {/* Suspend / Unsuspend */}
      <div className="flex flex-wrap items-start gap-2">
        <span className="text-xs text-white/50 w-16 shrink-0 pt-1">Suspend</span>
        <div className="flex-1 space-y-2">
          {isSuspended ? (
            <button
              onClick={handleUnsuspend}
              disabled={suspendLoading}
              className="px-3 py-1 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-40"
            >
              {suspendLoading ? 'Lifting…' : 'Unsuspend'}
            </button>
          ) : showSuspendForm ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value as SuspendDuration)}
                  disabled={suspendLoading}
                  className="px-2 py-1 text-sm bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-50"
                >
                  {(Object.entries(DURATION_LABELS) as [SuspendDuration, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <textarea
                  value={reason}
                  onChange={(e) => { setReason(e.target.value); setSuspendError(''); }}
                  disabled={suspendLoading}
                  rows={2}
                  maxLength={500}
                  placeholder="Reason for suspension (min 10 characters)…"
                  className="w-full px-2 py-1 text-sm bg-black/30 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-50 resize-none"
                />
                <div className="text-xs text-white/30 text-right">{reason.length}/500</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSuspend}
                  disabled={suspendLoading || reason.trim().length < 10}
                  className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {suspendLoading ? 'Suspending…' : 'Confirm Suspend'}
                </button>
                <button
                  onClick={() => { setShowSuspendForm(false); setReason(''); setSuspendError(''); }}
                  disabled={suspendLoading}
                  className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSuspendForm(true)}
              className="px-3 py-1 text-sm bg-red-600/70 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Suspend
            </button>
          )}
          {suspendError && <p className="text-xs text-red-400">{suspendError}</p>}
        </div>
      </div>
    </div>
  );
}
