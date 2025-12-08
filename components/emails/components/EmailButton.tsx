import { Button } from '@react-email/components';
import * as React from 'react';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

export const EmailButton: React.FC<EmailButtonProps> = ({ href, children }) => {
  return (
    <Button
      href={href}
      className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
      style={{
        backgroundColor: '#2563eb',
        color: '#ffffff',
        fontWeight: '600',
        padding: '12px 24px',
        borderRadius: '8px',
        textDecoration: 'none',
        display: 'inline-block',
      }}
    >
      {children}
    </Button>
  );
};
