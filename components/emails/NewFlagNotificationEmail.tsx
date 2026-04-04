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

interface NewFlagNotificationEmailProps {
  moderatorName: string;
  flagReason: string;
  incidentDescription: string;
  categoryLabel: string;
  playerIdentifier: string;
  gameName: string;
  flaggedAt: string;
  flagQueueUrl: string;
  preferencesUrl: string;
}

export const NewFlagNotificationEmail: React.FC<NewFlagNotificationEmailProps> = ({
  moderatorName = 'Moderator',
  flagReason = 'Suspicious behavior',
  incidentDescription = 'An incident was flagged for review.',
  categoryLabel = 'Incident',
  playerIdentifier = 'player#0000',
  gameName = 'Game',
  flaggedAt = new Date().toISOString(),
  flagQueueUrl = 'https://ratlist.gg/moderator/flags',
  preferencesUrl = 'https://ratlist.gg/admin/notifications',
}) => {
  const formattedDate = new Date(flaggedAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Html>
      <Head />
      <Preview>
        [Flag Queue] New flag — {categoryLabel} in {gameName}
      </Preview>
      <Body className="bg-slate-50 font-sans">
        <Container className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden my-8">
          <EmailHeader />

          <Section className="px-8 py-6">
            <Heading className="text-slate-900 text-2xl font-bold mb-4">
              New Flag Submitted
            </Heading>

            <Text className="text-slate-700 text-base leading-relaxed mb-4">
              Hi {moderatorName},
            </Text>

            <Text className="text-slate-700 text-base leading-relaxed mb-6">
              A new flag has been submitted in the moderation queue and requires your attention.
            </Text>

            <div className="bg-slate-100 border-l-4 border-orange-500 p-4 rounded-r-lg mb-6">
              <Text className="text-slate-900 font-semibold text-lg mb-2">
                {categoryLabel} — {gameName}
              </Text>
              <Text className="text-slate-700 text-sm mb-1">
                <strong>Player:</strong> {playerIdentifier}
              </Text>
              <Text className="text-slate-700 text-sm mb-1">
                <strong>Flag reason:</strong> {flagReason}
              </Text>
              <Text className="text-slate-700 text-sm mb-2">
                <strong>Incident description:</strong> {incidentDescription}
              </Text>
              <Text className="text-slate-500 text-sm m-0">
                Flagged on {formattedDate}
              </Text>
            </div>

            <Section className="text-center my-6">
              <EmailButton href={flagQueueUrl}>
                View Flag Queue
              </EmailButton>
            </Section>

            <Text className="text-slate-600 text-sm leading-relaxed mt-6">
              Review this flag and all pending flags in the moderation queue.
            </Text>
          </Section>

          <EmailFooter preferencesUrl={preferencesUrl} />
        </Container>
      </Body>
    </Html>
  );
};

export default NewFlagNotificationEmail;
