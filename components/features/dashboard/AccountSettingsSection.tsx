// T015: AccountSettingsSection component
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface UserProfile {
  display_name: string;
  email: string;
  created_at: string;
  email_notifications: boolean;
}

export function AccountSettingsSection() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const response = await fetch('/api/user/me');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setDisplayName(data.display_name || '');
        setEmailNotifications(data.email_notifications ?? true);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings() {
    setSaving(true);
    setMessage(null);

    try {
      // Update display name if changed
      if (displayName !== profile?.display_name) {
        const nameResponse = await fetch('/api/user/update-profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_name: displayName }),
        });

        if (!nameResponse.ok) {
          throw new Error('Failed to update display name');
        }
      }

      // Update email notifications if changed
      if (emailNotifications !== profile?.email_notifications) {
        const notifResponse = await fetch('/api/notifications/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: emailNotifications }),
        });

        if (!notifResponse.ok) {
          throw new Error('Failed to update notification settings');
        }
      }

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleExportData() {
    try {
      const response = await fetch('/api/user/export');
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ratlist-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setMessage({ type: 'success', text: 'Data exported successfully!' });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
    }
  }

  if (loading) {
    return (
      <Card className="p-6 border-white/10 bg-white/5 animate-pulse">
        <div className="space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3" />
          <div className="h-12 bg-white/10 rounded" />
          <div className="h-12 bg-white/10 rounded" />
        </div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="p-6 border-white/10 bg-white/5">
        <p className="text-white/60">Failed to load profile settings</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card className="p-6 border-white/10 bg-white/5">
        <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
        
        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <Label htmlFor="display-name" className="text-white/80">
              Display Name
            </Label>
            <Input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1.5 bg-white/5 border-white/20 text-white"
              placeholder="Your display name"
              aria-describedby="display-name-help"
              aria-required="false"
            />
            <p id="display-name-help" className="text-sm text-white/60 mt-1">
              This is your public username visible to other users
            </p>
          </div>

          {/* Email (read-only) */}
          <div>
            <Label htmlFor="email" className="text-white/80">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="mt-1.5 bg-white/5 border-white/20 text-white/60"
            />
          </div>

          {/* Joined Date */}
          <div>
            <Label className="text-white/80">Member Since</Label>
            <p className="text-white mt-1.5">
              {new Date(profile.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6 border-white/10 bg-white/5">
        <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="email-notifications" className="text-white/80">
              Email Notifications
            </Label>
            <p id="email-notifications-desc" className="text-sm text-white/60 mt-1">
              Receive email alerts when incidents are reported against your linked players
              (max 5 per day)
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
            aria-describedby="email-notifications-desc"
            aria-label="Toggle email notifications for incident reports"
          />
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex gap-4">
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-brand hover:bg-brand/90 text-brand-foreground"
          aria-label="Save account settings"
          aria-busy={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Message Display */}
      {message && (
        <div role="alert" aria-live="polite">
          <Card
            className={`p-4 border-white/10 ${
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}
          >
            <p
              className={`text-sm ${
                message.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {message.text}
            </p>
          </Card>
        </div>
      )}

      {/* Data Export (GDPR) */}
      <Card className="p-6 border-white/10 bg-white/5">
        <h3 className="text-lg font-semibold text-white mb-4">Data & Privacy</h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-white/80 mb-3">
              Export all your data including profile information, linked players, submitted reports,
              and flags in JSON format.
            </p>
            <Button
              onClick={handleExportData}
              variant="outline"
              className="border-white/20 hover:bg-white/5"
              aria-label="Export all your personal data in JSON format"
            >
              Export My Data
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
