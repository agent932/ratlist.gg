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

interface NewUserNotificationEmailProps {
  adminName: string;
  newUserDisplayName: string;
  newUserEmail: string;
  registeredAt: string;
  userManagementUrl: string;
  preferencesUrl: string;
}

export const NewUserNotificationEmail: React.FC<NewUserNotificationEmailProps> = ({
  adminName = 'Admin',
  newUserDisplayName = 'New User',
  newUserEmail = 'user@example.com',
  registeredAt = new Date().toISOString(),
  userManagementUrl = 'https://ratlist.gg/admin/users',
  preferencesUrl = 'https://ratlist.gg/admin/notifications',
}) => {
  const formattedDate = new Date(registeredAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Html>
      <Head />
      <Preview>
        [Admin] New user registered — {newUserDisplayName}
      </Preview>
      <Body className="bg-slate-50 font-sans">
        <Container className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden my-8">
          <EmailHeader />

          <Section className="px-8 py-6">
            <Heading className="text-slate-900 text-2xl font-bold mb-4">
              New User Registered
            </Heading>

            <Text className="text-slate-700 text-base leading-relaxed mb-4">
              Hi {adminName},
            </Text>

            <Text className="text-slate-700 text-base leading-relaxed mb-6">
              A new user has registered on Ratlist.gg.
            </Text>

            <div className="bg-slate-100 border-l-4 border-blue-600 p-4 rounded-r-lg mb-6">
              <Text className="text-slate-900 font-semibold text-lg mb-2">
                {newUserDisplayName}
              </Text>
              <Text className="text-slate-700 text-sm mb-1">
                <strong>Email:</strong> {newUserEmail}
              </Text>
              <Text className="text-slate-500 text-sm m-0">
                Registered on {formattedDate}
              </Text>
            </div>

            <Section className="text-center my-6">
              <EmailButton href={userManagementUrl}>
                View User Management
              </EmailButton>
            </Section>
          </Section>

          <EmailFooter preferencesUrl={preferencesUrl} />
        </Container>
      </Body>
    </Html>
  );
};

export default NewUserNotificationEmail;
