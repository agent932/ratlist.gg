import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { EmailButton } from './components/EmailButton';
import { EmailHeader } from './components/EmailHeader';
import { EmailFooter } from './components/EmailFooter';

interface UserSuspendedAdminAlertEmailProps {
  adminName: string;
  suspendedUserDisplayName: string;
  suspendedUserEmail: string;
  duration: string;
  reason: string;
  suspendedBy: string;
  suspendedUntil: string;
  userId: string;
  userManagementUrl: string;
  preferencesUrl: string;
}

export const UserSuspendedAdminAlertEmail: React.FC<UserSuspendedAdminAlertEmailProps> = ({
  adminName = 'Admin',
  suspendedUserDisplayName = 'User',
  suspendedUserEmail = 'user@example.com',
  duration = '24 Hours',
  reason = 'Policy violation',
  suspendedBy = 'Admin',
  suspendedUntil = new Date().toISOString(),
  userId = '',
  userManagementUrl = 'https://ratlist.gg/admin/users',
  preferencesUrl = 'https://ratlist.gg/admin/notifications',
}) => {
  const formattedUntil = new Date(suspendedUntil).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Html>
      <Head />
      <Preview>
        [Admin] User suspended — {suspendedUserDisplayName}
      </Preview>
      <Body className="bg-slate-50 font-sans">
        <Container className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden my-8">
          <EmailHeader />

          <Section className="px-8 py-6">
            <Heading className="text-slate-900 text-2xl font-bold mb-4">
              User Suspended
            </Heading>

            <Text className="text-slate-700 text-base leading-relaxed mb-4">
              Hi {adminName},
            </Text>

            <Text className="text-slate-700 text-base leading-relaxed mb-6">
              A user account has been suspended on Ratlist.gg.
            </Text>

            <div className="bg-slate-100 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
              <Text className="text-slate-900 font-semibold text-lg mb-2">
                {suspendedUserDisplayName}
              </Text>
              <Text className="text-slate-700 text-sm mb-1">
                <strong>Email:</strong> {suspendedUserEmail}
              </Text>
              <Text className="text-slate-700 text-sm mb-1">
                <strong>Duration:</strong> {duration}
              </Text>
              <Text className="text-slate-700 text-sm mb-1">
                <strong>Reason:</strong> {reason}
              </Text>
              <Text className="text-slate-700 text-sm mb-1">
                <strong>Suspended by:</strong> {suspendedBy}
              </Text>
              <Text className="text-slate-500 text-sm m-0">
                <strong>Suspended until:</strong> {formattedUntil}
              </Text>
            </div>

            <Section className="text-center my-6">
              <EmailButton href={`${userManagementUrl}/${userId}`}>
                View User Profile
              </EmailButton>
            </Section>
          </Section>

          <EmailFooter preferencesUrl={preferencesUrl} />
        </Container>
      </Body>
    </Html>
  );
};

export default UserSuspendedAdminAlertEmail;
