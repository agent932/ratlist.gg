// T013: MyFlagsSection component
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlagCard } from './FlagCard';

interface Flag {
  id: string;
  incident_id: string;
  player_id: string;
  game_name: string;
  game_slug: string;
  incident_category: string;
  incident_description: string;
  flag_reason: string;
  resolution: string;
  created_at: string;
  reviewed_at?: string | null;
  reviewer_name?: string | null;
  moderator_notes?: string | null;
}

const resolutionFilters = [
  { id: 'all', label: 'All Flags' },
  { id: 'open', label: 'Open' },
  { id: 'approved', label: 'Approved' },
  { id: 'dismissed', label: 'Dismissed' },
];

export function MyFlagsSection() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/user/flags?resolution=${activeFilter}&page=${page}&limit=20`
      );
      if (response.ok) {
        const data = await response.json();
        setFlags(data.flags || []);
        setHasMore(data.has_more || false);
        setTotalCount(data.total_count || 0);
      }
    } catch (error) {
      console.error('Error fetching flags:', error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, page]);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  function handleFilterChange(filterId: string) {
    setActiveFilter(filterId);
    setPage(1); // Reset to first page when filter changes
  }

  function handlePreviousPage() {
    if (page > 1) {
      setPage(page - 1);
    }
  }

  function handleNextPage() {
    if (hasMore) {
      setPage(page + 1);
    }
  }

  if (loading && flags.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 border-white/10 bg-white/5 animate-pulse">
            <div className="h-24 bg-white/10 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4 border-white/10 bg-white/5">
        <div className="flex flex-wrap gap-2">
          {resolutionFilters.map((filter) => (
            <Button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              variant={activeFilter === filter.id ? 'default' : 'outline'}
              className={
                activeFilter === filter.id
                  ? 'bg-brand hover:bg-brand/90 text-brand-foreground'
                  : 'border-white/20 hover:bg-white/5'
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>
        <div className="mt-2 text-sm text-white/60">
          Showing {flags.length} of {totalCount} flags
        </div>
      </Card>

      {/* Flags List */}
      {flags.length > 0 ? (
        <div className="space-y-4">
          {flags.map((flag) => (
            <FlagCard key={flag.id} flag={flag} />
          ))}
        </div>
      ) : (
        <Card className="p-12 border-white/10 bg-white/5 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-white/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Flags Found
            </h3>
            <p className="text-white/60">
              {activeFilter === 'all'
                ? "You haven't flagged any reports yet. Flag reports that you believe are inaccurate or fraudulent."
                : `You don't have any ${activeFilter} flags.`}
            </p>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {flags.length > 0 && (page > 1 || hasMore) && (
        <Card className="p-4 border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePreviousPage}
              disabled={page === 1}
              variant="outline"
              className="border-white/20 hover:bg-white/5"
            >
              Previous
            </Button>
            <span className="text-white/60">Page {page}</span>
            <Button
              onClick={handleNextPage}
              disabled={!hasMore}
              variant="outline"
              className="border-white/20 hover:bg-white/5"
            >
              Next
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
