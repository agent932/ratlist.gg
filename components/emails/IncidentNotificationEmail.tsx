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
import { EmailFooter } from './components/EmailFooter';
import { EmailHeader } from './components/EmailHeader';

interface IncidentNotificationEmailProps {
  userName: string;
  playerIdentifier: string;
  gameName: string;
  categoryLabel: string;
  description: string;
  reportedAt: string;
  dashboardUrl: string;
  incidentUrl: string;
  preferencesUrl: string;
}

export const IncidentNotificationEmail: React.FC<IncidentNotificationEmailProps> = ({
  userName = 'Player',
  playerIdentifier = 'YourPlayer',
  gameName = 'Game',
  categoryLabel = 'Incident',
  description = 'An incident was reported.',
  reportedAt = new Date().toISOString(),
  dashboardUrl = 'https://ratlist.gg/dashboard',
  incidentUrl = 'https://ratlist.gg/dashboard',
  preferencesUrl = 'https://ratlist.gg/dashboard',
}) => {
  const formattedDate = new Date(reportedAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Html>
      <Head />
      <Preview>
        New {categoryLabel} incident reported for {playerIdentifier} in {gameName}
      </Preview>
      <Body className="bg-slate-50 font-sans">
        <Container className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden my-8">
          <EmailHeader />
          
          <Section className="px-8 py-6">
            <Heading className="text-slate-900 text-2xl font-bold mb-4">
              New Incident Report
            </Heading>
            
            <Text className="text-slate-700 text-base leading-relaxed mb-4">
              Hi {userName},
            </Text>
            
            <Text className="text-slate-700 text-base leading-relaxed mb-6">
              A new incident has been reported against your linked player <strong>{playerIdentifier}</strong> in <strong>{gameName}</strong>.
            </Text>

            <div className="bg-slate-100 border-l-4 border-blue-600 p-4 rounded-r-lg mb-6">
              <Text className="text-slate-900 font-semibold text-lg mb-2">
                {categoryLabel}
              </Text>
              <Text className="text-slate-700 text-base mb-2">
                {description}
              </Text>
              <Text className="text-slate-500 text-sm m-0">
                Reported on {formattedDate}
              </Text>
            </div>

            <Section className="text-center my-6">
              <EmailButton href={incidentUrl}>
                View Incident Details
              </EmailButton>
            </Section>

            <Text className="text-slate-600 text-sm leading-relaxed mt-6">
              You can review this incident and all others on your{' '}
              <a href={dashboardUrl} className="text-blue-600 underline">
                dashboard
              </a>
              .
            </Text>
          </Section>

          <EmailFooter preferencesUrl={preferencesUrl} />
        </Container>
      </Body>
    </Html>
  );
};

export default IncidentNotificationEmail;
