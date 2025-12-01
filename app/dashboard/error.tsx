// Error boundary for dashboard
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto p-8 border-white/10 bg-white/5">
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Something went wrong!
            </h2>
            <p className="text-white/60 mb-6">
              {error.message || 'An error occurred while loading your dashboard.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={reset}
                className="bg-brand hover:bg-brand/90 text-brand-foreground"
              >
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant="outline"
                className="border-white/20 hover:bg-white/5"
              >
                Go Home
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
