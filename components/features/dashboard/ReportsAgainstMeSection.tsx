// T014: ReportsAgainstMeSection component
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IncidentCard } from './IncidentCard';
import Link from 'next/link';
import { formatPlayerName } from '@/lib/utils/player';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

interface IncidentData {
  id: string;
  status: string;
  category_name?: string;
  severity?: string;
  description?: string;
  created_at: string;
}

interface LinkedPlayerWithIncidents {
  player_id: string;
  game_name: string;
  game_slug: string;
  tier: string;
  incident_count: number;
  incidents: Array<{
    id: string;
    player_id: string;
    game_name: string;
    game_slug: string;
    category_name: string;
    severity: string;
    description: string;
    status: string;
    created_at: string;
  }>;
}

export function ReportsAgainstMeSection() {
  const { user, loading: userLoading } = useCurrentUser();
  const [playersWithIncidents, setPlayersWithIncidents] = useState<LinkedPlayerWithIncidents[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalIncidents, setTotalIncidents] = useState(0);
  const username = user?.display_name || user?.email || null;

  useEffect(() => {
    async function fetchData() {
      if (!username) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch user profile with linked players and their incidents
        const response = await fetch(`/api/user/${username}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.status}`);
        }
        
        const data = await response.json();
        const linkedPlayers = data.linked_players || [];
        
        console.log('[ReportsAgainstMe] Linked players:', linkedPlayers);
        
        if (linkedPlayers.length === 0) {
          setLoading(false);
          return;
        }
        
        // For each linked player, fetch their incidents
        const playersData: LinkedPlayerWithIncidents[] = [];
        let total = 0;

        for (const player of linkedPlayers) {
          // Fetch incidents for this player (API filters for active by default)
          const incidentsUrl = `/api/incidents?game=${encodeURIComponent(player.game_slug)}&player=${encodeURIComponent(player.player_id)}&status=active`;
          console.log('[ReportsAgainstMe] Fetching incidents:', incidentsUrl);
          const incidentsResponse = await fetch(incidentsUrl);
          
          if (!incidentsResponse.ok) {
            console.warn(`Failed to fetch incidents for ${player.player_id}:`, incidentsResponse.status);
            continue;
          }
          
          const incidentsData = await incidentsResponse.json();
          const incidents = incidentsData.incidents || [];
          
          console.log(`[ReportsAgainstMe] Incidents for ${player.player_id}:`, incidents.length, incidents);

          if (incidents.length > 0) {
            playersData.push({
              player_id: player.player_id,
              game_name: player.game_name,
              game_slug: player.game_slug,
              tier: player.tier || 'F',
              incident_count: incidents.length,
              incidents: incidents.map((inc: IncidentData) => ({
                id: inc.id,
                player_id: player.player_id,
                game_name: player.game_name,
                game_slug: player.game_slug,
                category_name: inc.category_name || 'Unknown',
                severity: inc.severity || 'low',
                description: inc.description,
                status: inc.status,
                created_at: inc.created_at,
              })),
            });
            total += incidents.length;
          }
        }

        setPlayersWithIncidents(playersData);
        setTotalIncidents(total);
      } catch (err) {
        console.error('Failed to fetch reports against me:', err);
        setError(err instanceof Error ? err.message : 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    }

    if (!userLoading) {
      fetchData();
    }
  }, [username, userLoading]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="p-6 border-white/10 bg-white/5 animate-pulse">
            <div className="h-32 bg-white/10 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-12 border-red-500/20 bg-red-500/5 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500/60"
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
          <h3 className="text-lg font-semibold text-white mb-2">
            Error Loading Reports
          </h3>
          <p className="text-white/60 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand hover:bg-brand/90 text-brand-foreground rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  if (playersWithIncidents.length === 0) {
    return (
      <Card className="p-12 border-white/10 bg-white/5 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-green-500/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Clean Record!
          </h3>
          <p className="text-white/60">
            No active reports against your linked players. Keep up the good sportsmanship!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Card */}
      <Card className="p-6 border-white/10 bg-gradient-to-br from-orange-500/10 to-red-500/10">
        <div className="space-y-4">
          {/* Header with Total Count */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Total Active Reports
              </h3>
              <p className="text-sm text-white/60">
                Across {playersWithIncidents.length} linked player{playersWithIncidents.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-4xl font-bold text-orange-400">
              {totalIncidents}
            </div>
          </div>

          {/* Player Breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white/80 mb-2">Breakdown by Player</h4>
            {playersWithIncidents.map((playerData) => {
              // Group incidents by severity
              const severityCounts = playerData.incidents.reduce((acc, inc) => {
                const sev = inc.severity || 'low';
                acc[sev] = (acc[sev] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);

              return (
                <div 
                  key={`${playerData.game_slug}-${playerData.player_id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Badge variant="outline" className="border-brand/30 text-brand text-xs shrink-0">
                      {playerData.game_name}
                    </Badge>
                    <Link
                      href={`/player/${playerData.game_slug}/${playerData.player_id}`}
                      className="text-sm font-medium text-white hover:text-brand transition-colors truncate"
                    >
                      {formatPlayerName(playerData.player_id, true)}
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Severity badges */}
                    <div className="flex items-center gap-1">
                      {severityCounts.critical && (
                        <Badge variant="outline" className="border-red-500/30 text-red-400 text-xs">
                          {severityCounts.critical} Critical
                        </Badge>
                      )}
                      {severityCounts.high && (
                        <Badge variant="outline" className="border-orange-500/30 text-orange-400 text-xs">
                          {severityCounts.high} High
                        </Badge>
                      )}
                      {severityCounts.medium && (
                        <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 text-xs">
                          {severityCounts.medium} Med
                        </Badge>
                      )}
                      {severityCounts.low && (
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                          {severityCounts.low} Low
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-orange-400">
                        {playerData.incident_count}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Reports by Player */}
      {playersWithIncidents.map((playerData) => (
        <Card key={`${playerData.game_slug}-${playerData.player_id}`} className="p-6 border-white/10 bg-white/5">
          {/* Player Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-brand/30 text-brand">
                {playerData.game_name}
              </Badge>
              <Link
                href={`/player/${playerData.game_slug}/${playerData.player_id}`}
                className="text-lg font-semibold text-white hover:text-brand transition-colors"
              >
                {formatPlayerName(playerData.player_id, true)}
              </Link>
              <Badge variant="outline" className={getTierColor(playerData.tier)}>
                Tier {playerData.tier}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-400">
                {playerData.incident_count}
              </div>
              <div className="text-sm text-white/60">
                {playerData.incident_count === 1 ? 'Report' : 'Reports'}
              </div>
            </div>
          </div>

          {/* Incidents List */}
          <div className="space-y-3">
            {playerData.incidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                showModerationInfo={false}
              />
            ))}
          </div>
        </Card>
      ))}

      {/* Info Card */}
      <Card className="p-4 border-white/10 bg-blue-500/5">
        <p className="text-sm text-white/80">
          <strong>Note:</strong> If you believe any of these reports are inaccurate or fraudulent,
          you can flag them for moderator review by visiting the incident detail page.
        </p>
      </Card>
    </div>
  );
}

function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    'S': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    'A': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'B': 'bg-green-500/10 text-green-500 border-green-500/20',
    'C': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'D': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'F': 'bg-red-500/10 text-red-500 border-red-500/20',
  };
  return colors[tier] || colors['F'];
}
