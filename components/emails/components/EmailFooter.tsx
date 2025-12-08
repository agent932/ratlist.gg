import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';

interface EmailFooterProps {
  preferencesUrl: string;
}

export const EmailFooter: React.FC<EmailFooterProps> = ({ preferencesUrl }) => {
  return (
    <>
      <Hr className="border-slate-200 my-6" />
      <Section className="px-8 pb-6">
        <Text className="text-slate-600 text-sm leading-relaxed">
          You received this email because an incident was reported against your linked player.
        </Text>
        <Text className="text-slate-600 text-sm leading-relaxed">
          <Link href={preferencesUrl} className="text-blue-600 underline">
            Manage your notification preferences
          </Link>{' '}
          or disable email notifications from your dashboard.
        </Text>
        <Text className="text-slate-500 text-xs mt-4">
          © {new Date().getFullYear()} Ratlist.gg. All rights reserved.
        </Text>
      </Section>
    </>
  );
};
