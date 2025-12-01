// T009: LinkedPlayersSection component
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LinkedPlayerCard } from '@/components/features/user/LinkedPlayerCard';
import { LinkPlayerForm } from '@/components/features/user/LinkPlayerForm';

interface LinkedPlayer {
  id: string;
  player_id: string;
  game_id: string;
  game_name: string;
  game_slug: string;
  linked_at: string;
  incident_count: number;
  tier: string;
}

export function LinkedPlayersSection() {
  const [linkedPlayers, setLinkedPlayers] = useState<LinkedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLinkedPlayers() {
      try {
        // Get current user's username first
        const userResponse = await fetch('/api/user/me');
        if (!userResponse.ok) {
          setLoading(false);
          return;
        }
        const userData = await userResponse.json();
        setUsername(userData.display_name || userData.email);

        // Fetch linked players
        const response = await fetch(`/api/user/${userData.display_name || userData.email}`);
        if (response.ok) {
          const data = await response.json();
          setLinkedPlayers(data.linked_players || []);
        }
      } catch (error) {
        console.error('Failed to fetch linked players:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLinkedPlayers();
  }, []);

  const handlePlayerLinked = () => {
    setShowLinkForm(false);
    // Refresh the linked players list
    window.location.reload();
  };

  const handlePlayerUnlinked = () => {
    // Refresh the linked players list
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="p-6 border-white/10 bg-white/5 animate-pulse">
            <div className="h-20 bg-white/10 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Link New Player Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Your Linked Players</h2>
          <p className="text-sm text-white/60 mt-1">
            Claim your player profiles to track your reputation and receive notifications
          </p>
        </div>
        <Button
          onClick={() => setShowLinkForm(!showLinkForm)}
          className="bg-brand hover:bg-brand/90 text-brand-foreground"
        >
          {showLinkForm ? 'Cancel' : 'Link New Player'}
        </Button>
      </div>

      {/* Link Player Form */}
      {showLinkForm && (
        <Card className="p-6 border-white/10 bg-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">Link a Player ID</h3>
          <LinkPlayerForm onSuccess={handlePlayerLinked} />
        </Card>
      )}

      {/* Linked Players Grid */}
      {linkedPlayers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {linkedPlayers.map((player) => (
            <LinkedPlayerCard
              key={player.id}
              playerId={player.player_id}
              gameId={player.game_id}
              gameName={player.game_name}
              linkedAt={player.linked_at}
              incidentCount={player.incident_count}
              canUnlink={true}
              onUnlink={handlePlayerUnlinked}
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
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Linked Players Yet
            </h3>
            <p className="text-white/60 mb-6">
              Link your in-game player IDs to claim ownership, track your reputation,
              and receive notifications when you&apos;re reported.
            </p>
            <Button
              onClick={() => setShowLinkForm(true)}
              className="bg-brand hover:bg-brand/90 text-brand-foreground"
            >
              Link Your First Player
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
