'use client';

import { useEffect, useState } from 'react';

interface UserProfile {
  user_id: string;
  email: string;
  display_name: string | null;
  role: string;
  created_at: string;
  suspended_until: string | null;
  suspension_reason: string | null;
}

interface UseCurrentUserReturn {
  user: UserProfile | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch and manage current user data
 * Eliminates duplicate user fetching logic across components
 */
export function useCurrentUser(): UseCurrentUserReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUser() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/user/me', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUser();

    return () => {
      controller.abort();
    };
  }, [refetchTrigger]);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  return { user, loading, error, refetch };
}
