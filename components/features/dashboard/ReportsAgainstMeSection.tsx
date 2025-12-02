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
  const [totalIncidents, setTotalIncidents] = useState(0);
  const username = user?.display_name || user?.email || null;

  useEffect(() => {
    async function fetchData() {
      if (!username) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch user profile with linked players and their incidents
        const response = await fetch(`/api/user/${username}`);
        if (response.ok) {
          const data = await response.json();
          const linkedPlayers = data.linked_players || [];
          
          // For each linked player, fetch their incidents
          const playersData: LinkedPlayerWithIncidents[] = [];
          let total = 0;

          for (const player of linkedPlayers) {
            // Fetch incidents for this player
            const incidentsResponse = await fetch(
              `/api/incidents?game=${player.game_slug}&player=${player.player_id}`
            );
            
            if (incidentsResponse.ok) {
              const incidentsData = await incidentsResponse.json();
              const activeIncidents = (incidentsData.incidents || []).filter(
                (inc: IncidentData) => inc.status === 'active'
              );

              if (activeIncidents.length > 0) {
                playersData.push({
                  player_id: player.player_id,
                  game_name: player.game_name,
                  game_slug: player.game_slug,
                  tier: player.tier || 'F',
                  incident_count: activeIncidents.length,
                  incidents: activeIncidents.map((inc: IncidentData) => ({
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
                total += activeIncidents.length;
              }
            }
          }

          setPlayersWithIncidents(playersData);
          setTotalIncidents(total);
        }
      } catch (error) {
        console.error('Failed to fetch reports against me:', error);
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
      {/* Summary Card */}
      <Card className="p-6 border-white/10 bg-gradient-to-br from-orange-500/10 to-red-500/10">
        <div className="flex items-center justify-between">
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
