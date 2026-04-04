import { createSupabaseAdmin } from '@/lib/supabase/server';
import { resend } from '@/lib/email/resend';
import { render } from '@react-email/components';
import React from 'react';
import { NewFlagNotificationEmail } from '@/components/emails/NewFlagNotificationEmail';
import { NewUserNotificationEmail } from '@/components/emails/NewUserNotificationEmail';
import { UserSuspendedAdminAlertEmail } from '@/components/emails/UserSuspendedAdminAlertEmail';
import { SuspensionNoticeEmail } from '@/components/emails/SuspensionNoticeEmail';

const FROM = process.env.EMAIL_FROM || 'Ratlist.gg <noreply@ratlist.gg>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ratlist.gg';

async function getRecipientsForPref(
  pref: 'notify_new_flag' | 'notify_flag_resolved' | 'notify_new_user' | 'notify_user_suspended',
  roleFilter: 'moderator' | 'admin' | 'both'
): Promise<Array<{ email: string; display_name: string }>> {
  const supabase = createSupabaseAdmin();

  // Build role filter
  const roles = roleFilter === 'both' ? ['moderator', 'admin'] : [roleFilter];

  const { data, error } = await supabase
    .from('admin_notification_prefs')
    .select(`user_id, ${pref}, user_profiles!inner(display_name, role)`)
    .eq(pref, true)
    .in('user_profiles.role', roles);

  if (error || !data) return [];

  // Get emails from auth
  const userIds = data.map((row: any) => row.user_id);
  const emailMap: Record<string, string> = {};
  await Promise.allSettled(
    userIds.map(async (uid: string) => {
      const { data: authUser } = await supabase.auth.admin.getUserById(uid);
      if (authUser?.user?.email) emailMap[uid] = authUser.user.email;
    })
  );

  return data
    .map((row: any) => ({
      email: emailMap[row.user_id] || '',
      display_name: (row.user_profiles as any)?.display_name || 'Admin',
    }))
    .filter((r) => r.email);
}

export async function notifyModsOfNewFlag(payload: {
  flagReason: string;
  incidentDescription: string;
  categoryLabel: string;
  playerIdentifier: string;
  gameName: string;
  flaggedAt: string;
}) {
  const recipients = await getRecipientsForPref('notify_new_flag', 'both');
  if (!recipients.length) return;

  await Promise.allSettled(
    recipients.map(async (r) => {
      const html = await render(
        React.createElement(NewFlagNotificationEmail, {
          moderatorName: r.display_name,
          flagQueueUrl: `${APP_URL}/moderator/flags`,
          preferencesUrl: `${APP_URL}/admin/notifications`,
          ...payload,
        })
      );
      return resend.emails.send({
        from: FROM,
        to: r.email,
        subject: `[Flag Queue] New flag — ${payload.categoryLabel} in ${payload.gameName}`,
        html,
      });
    })
  );
}

export async function notifyAdminsOfNewUser(payload: {
  newUserDisplayName: string;
  newUserEmail: string;
  registeredAt: string;
}) {
  const recipients = await getRecipientsForPref('notify_new_user', 'admin');
  if (!recipients.length) return;

  await Promise.allSettled(
    recipients.map(async (r) => {
      const html = await render(
        React.createElement(NewUserNotificationEmail, {
          adminName: r.display_name,
          userManagementUrl: `${APP_URL}/admin/users`,
          preferencesUrl: `${APP_URL}/admin/notifications`,
          ...payload,
        })
      );
      return resend.emails.send({
        from: FROM,
        to: r.email,
        subject: `[Admin] New user registered — ${payload.newUserDisplayName}`,
        html,
      });
    })
  );
}

export async function notifyAdminsOfSuspension(payload: {
  suspendedUserDisplayName: string;
  suspendedUserEmail: string;
  duration: string;
  reason: string;
  suspendedBy: string;
  suspendedUntil: string;
  userId: string;
}) {
  const recipients = await getRecipientsForPref('notify_user_suspended', 'admin');
  if (!recipients.length) return;

  await Promise.allSettled(
    recipients.map(async (r) => {
      const html = await render(
        React.createElement(UserSuspendedAdminAlertEmail, {
          adminName: r.display_name,
          userManagementUrl: `${APP_URL}/admin/users`,
          preferencesUrl: `${APP_URL}/admin/notifications`,
          ...payload,
        })
      );
      return resend.emails.send({
        from: FROM,
        to: r.email,
        subject: `[Admin] User suspended — ${payload.suspendedUserDisplayName}`,
        html,
      });
    })
  );
}

export async function sendSuspensionNoticeToUser(payload: {
  toEmail: string;
  userName: string;
  reason: string;
  duration: string;
  suspendedUntil: string;
}) {
  const html = await render(
    React.createElement(SuspensionNoticeEmail, {
      contactUrl: `${APP_URL}/contact`,
      ...payload,
    })
  );
  await resend.emails
    .send({
      from: FROM,
      to: payload.toEmail,
      subject: 'Your Ratlist.gg account has been suspended',
      html,
    })
    .catch((e) => console.error('Failed to send suspension notice:', e));
}
