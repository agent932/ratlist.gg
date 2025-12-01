// T011: MyIncidentsSection component
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IncidentCard } from './IncidentCard';

interface Incident {
  id: string;
  player_id: string;
  game_name: string;
  game_slug: string;
  category_name: string;
  severity: string;
  description: string;
  status: string;
  flagged?: boolean;
  created_at: string;
  moderated_at?: string | null;
  moderation_reason?: string | null;
  moderator_name?: string | null;
}

const statusFilters = [
  { id: 'all', label: 'All Reports' },
  { id: 'active', label: 'Active' },
  { id: 'removed', label: 'Removed' },
  { id: 'flagged', label: 'Flagged' },
];

export function MyIncidentsSection() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/user/incidents?status=${activeFilter}&page=${page}&limit=20`
      );
      if (response.ok) {
        const data = await response.json();
        setIncidents(data.incidents || []);
        setHasMore(data.has_more || false);
        setTotalCount(data.total_count || 0);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, page]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

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

  if (loading && incidents.length === 0) {
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
          {statusFilters.map((filter) => (
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
          Showing {incidents.length} of {totalCount} reports
        </div>
      </Card>

      {/* Incidents List */}
      {incidents.length > 0 ? (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              showModerationInfo={true}
            />
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Reports Found
            </h3>
            <p className="text-white/60 mb-6">
              {activeFilter === 'all'
                ? "You haven't submitted any incident reports yet."
                : `You don't have any ${activeFilter} reports.`}
            </p>
            {activeFilter === 'all' && (
              <Button
                onClick={() => (window.location.href = '/report')}
                className="bg-brand hover:bg-brand/90 text-brand-foreground"
              >
                Submit Your First Report
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Pagination */}
      {incidents.length > 0 && (page > 1 || hasMore) && (
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
