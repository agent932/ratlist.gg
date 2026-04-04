import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { EmailHeader } from './components/EmailHeader';

interface SuspensionNoticeEmailProps {
  toEmail: string;
  userName: string;
  reason: string;
  duration: string;
  suspendedUntil: string;
  contactUrl: string;
}

export const SuspensionNoticeEmail: React.FC<SuspensionNoticeEmailProps> = ({
  toEmail = 'user@example.com',
  userName = 'User',
  reason = 'Policy violation',
  duration = '24 Hours',
  suspendedUntil = new Date().toISOString(),
  contactUrl = 'https://ratlist.gg/contact',
}) => {
  const formattedUntil = new Date(suspendedUntil).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const isPermanent = duration.toLowerCase() === 'permanent';

  return (
    <Html>
      <Head />
      <Preview>
        Your Ratlist.gg account has been suspended
      </Preview>
      <Body className="bg-slate-50 font-sans">
        <Container className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden my-8">
          <EmailHeader />

          <Section className="px-8 py-6">
            <Heading className="text-slate-900 text-2xl font-bold mb-4">
              Account Suspended
            </Heading>

            <Text className="text-slate-700 text-base leading-relaxed mb-4">
              Hi {userName},
            </Text>

            <Text className="text-slate-700 text-base leading-relaxed mb-6">
              Your Ratlist.gg account has been suspended due to a violation of our community guidelines.
            </Text>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
              <Text className="text-slate-900 font-semibold text-base mb-2">
                Suspension Details
              </Text>
              <Text className="text-slate-700 text-sm mb-1">
                <strong>Reason:</strong> {reason}
              </Text>
              <Text className="text-slate-700 text-sm mb-1">
                <strong>Duration:</strong> {duration}
              </Text>
              {!isPermanent && (
                <Text className="text-slate-700 text-sm m-0">
                  <strong>Suspended until:</strong> {formattedUntil}
                </Text>
              )}
              {isPermanent && (
                <Text className="text-slate-700 text-sm m-0">
                  This suspension is permanent.
                </Text>
              )}
            </div>

            <Text className="text-slate-700 text-base leading-relaxed mb-4">
              During this suspension period, you will not be able to access your account or use Ratlist.gg services.
            </Text>

            {!isPermanent && (
              <Text className="text-slate-700 text-base leading-relaxed mb-4">
                Your account will be automatically reinstated on {formattedUntil}.
              </Text>
            )}

            <Text className="text-slate-700 text-base leading-relaxed mb-6">
              If you believe this suspension was made in error, please{' '}
              <Link href={contactUrl} className="text-blue-600 underline">
                contact us
              </Link>{' '}
              to appeal this decision.
            </Text>

            <Hr className="border-slate-200 my-6" />

            <Section className="pb-6">
              <Text className="text-slate-500 text-xs mt-4">
                © {new Date().getFullYear()} Ratlist.gg. All rights reserved.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default SuspensionNoticeEmail;
