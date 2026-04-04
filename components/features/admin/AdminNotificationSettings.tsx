'use client';

import { useState, useCallback } from 'react';

interface NotificationPrefs {
  notify_new_flag: boolean;
  notify_flag_resolved: boolean;
  notify_new_user: boolean;
  notify_user_suspended: boolean;
}

interface AdminNotificationSettingsProps {
  initialPrefs: NotificationPrefs | null;
  isAdmin: boolean;
}

type PrefKey = keyof NotificationPrefs;

interface ToggleRowProps {
  label: string;
  description: string;
  prefKey: PrefKey;
  value: boolean;
  saving: PrefKey | null;
  flash: { key: PrefKey; type: 'success' | 'error' } | null;
  onToggle: (key: PrefKey, value: boolean) => void;
}

function ToggleRow({ label, description, prefKey, value, saving, flash, onToggle }: ToggleRowProps) {
  const isSaving = saving === prefKey;
  const flashState = flash?.key === prefKey ? flash.type : null;

  return (
    <div className="flex items-center justify-between py-4 border-b border-white/10 last:border-0">
      <div className="flex-1 mr-6">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">{label}</span>
          {flashState === 'success' && (
            <span className="text-green-400 text-xs">Saved</span>
          )}
          {flashState === 'error' && (
            <span className="text-red-400 text-xs">Failed to save</span>
          )}
        </div>
        <p className="text-white/50 text-xs mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        disabled={isSaving}
        onClick={() => onToggle(prefKey, !value)}
        className={[
          'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent',
          'transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-black',
          isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          value ? 'bg-brand' : 'bg-white/20',
        ].join(' ')}
      >
        <span
          aria-hidden="true"
          className={[
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0',
            'transition duration-200 ease-in-out',
            value ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

export function AdminNotificationSettings({ initialPrefs, isAdmin }: AdminNotificationSettingsProps) {
  const defaultPrefs: NotificationPrefs = {
    notify_new_flag: true,
    notify_flag_resolved: false,
    notify_new_user: true,
    notify_user_suspended: true,
  };

  const [prefs, setPrefs] = useState<NotificationPrefs>(initialPrefs ?? defaultPrefs);
  const [saving, setSaving] = useState<PrefKey | null>(null);
  const [flash, setFlash] = useState<{ key: PrefKey; type: 'success' | 'error' } | null>(null);

  const handleToggle = useCallback(async (key: PrefKey, newValue: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: newValue }));
    setSaving(key);
    setFlash(null);

    try {
      const response = await fetch('/api/admin/notifications/prefs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newValue }),
      });

      if (!response.ok) {
        // Revert on failure
        setPrefs((prev) => ({ ...prev, [key]: !newValue }));
        setFlash({ key, type: 'error' });
      } else {
        setFlash({ key, type: 'success' });
      }
    } catch {
      // Revert on error
      setPrefs((prev) => ({ ...prev, [key]: !newValue }));
      setFlash({ key, type: 'error' });
    } finally {
      setSaving(null);
      setTimeout(() => setFlash(null), 3000);
    }
  }, []);

  const moderationRows = [
    {
      label: 'New flag submitted',
      description: 'Receive an email when a user submits a new flag for moderation review.',
      prefKey: 'notify_new_flag' as PrefKey,
    },
    {
      label: 'Flag resolved',
      description: 'Receive an email when a flag in the queue is resolved or closed.',
      prefKey: 'notify_flag_resolved' as PrefKey,
    },
  ];

  const userManagementRows = [
    {
      label: 'New user registered',
      description: 'Receive an email when a new user creates an account on Ratlist.gg.',
      prefKey: 'notify_new_user' as PrefKey,
    },
    {
      label: 'User suspended',
      description: 'Receive an email when an admin suspends a user account.',
      prefKey: 'notify_user_suspended' as PrefKey,
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Moderation section */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-white font-semibold text-lg mb-1">Moderation</h2>
        <p className="text-white/50 text-sm mb-4">Notifications for moderation queue activity.</p>
        <div>
          {moderationRows.map((row) => (
            <ToggleRow
              key={row.prefKey}
              label={row.label}
              description={row.description}
              prefKey={row.prefKey}
              value={prefs[row.prefKey]}
              saving={saving}
              flash={flash}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>

      {/* User Management section — admins only */}
      {isAdmin && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-semibold text-lg mb-1">User Management</h2>
          <p className="text-white/50 text-sm mb-4">Notifications for user account activity.</p>
          <div>
            {userManagementRows.map((row) => (
              <ToggleRow
                key={row.prefKey}
                label={row.label}
                description={row.description}
                prefKey={row.prefKey}
                value={prefs[row.prefKey]}
                saving={saving}
                flash={flash}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
