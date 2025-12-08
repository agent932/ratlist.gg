import { Img, Section, Text } from '@react-email/components';
import * as React from 'react';

export const EmailHeader: React.FC = () => {
  return (
    <Section className="bg-slate-900 py-6 px-8">
      <div className="flex items-center gap-3">
        <Img
          src={`${process.env.NEXT_PUBLIC_APP_URL || 'https://ratlist.gg'}/logo.png`}
          alt="Ratlist.gg"
          width="40"
          height="40"
          className="rounded-lg"
        />
        <Text className="text-white text-2xl font-bold m-0">
          Ratlist.gg
        </Text>
      </div>
    </Section>
  );
};
