'use client';

// M010: Flag queue table component
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPlayerName } from '@/lib/utils/player';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Flag = {
  flag_id: string;
  flag_reason: string;
  flag_status: string;
  flag_created_at: string;
  flag_resolution: string | null;
  incident_id: string;
  incident_description: string;
  incident_category_label: string;
  reported_player_identifier: string;
  reporter_email: string | null;
  reporter_display_name: string | null;
  flagger_email: string | null;
  flagger_display_name: string | null;
  game_name: string;
};

type FlagQueueTableProps = {
  flags: Flag[];
};

export function FlagQueueTable({ flags }: FlagQueueTableProps) {
  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null);
  const [actionType, setActionType] = useState<'dismiss' | 'remove' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (flagId: string, resolution: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/moderator/flags/${flagId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'closed',
          resolution,
        }),
      });

      if (response.ok) {
        window.location.reload(); // Refresh to show updated status
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to update flag'}`);
      }
    } catch (error) {
      console.error('Error updating flag:', error);
      alert('Failed to update flag');
    } finally {
      setIsLoading(false);
      setSelectedFlag(null);
      setActionType(null);
    }
  };

  const openConfirmation = (flag: Flag, action: 'dismiss' | 'remove') => {
    setSelectedFlag(flag);
    setActionType(action);
  };

  if (flags.length === 0) {
    return (
      <Card className="p-8 text-center border-white/10 bg-white/5">
        <p className="text-white/60">No flags to review</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4" role="list" aria-label="Flag queue items">
        {flags.map((flag) => (
          <div 
            key={flag.flag_id}
            role="listitem"
            aria-label={`Flag for ${formatPlayerName(flag.reported_player_identifier)} in ${flag.game_name}`}
          >
            <Card className="p-6 border-white/10 bg-white/5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-brand/20 text-brand border-brand/30">
                    {flag.game_name}
                  </Badge>
                  <Badge variant="outline">{flag.incident_category_label}</Badge>
                  {flag.flag_status === 'closed' && (
                    <Badge variant="secondary">Reviewed</Badge>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-1">
                  Player: {formatPlayerName(flag.reported_player_identifier)}
                </h3>
                
                <p className="text-sm text-white/60 mb-3">
                  Flagged {new Date(flag.flag_created_at).toLocaleDateString()} by{' '}
                  {flag.flagger_display_name || flag.flagger_email || 'Anonymous'}
                </p>
              </div>

              {flag.flag_status === 'open' && (
                <div className="flex gap-2" role="group" aria-label="Flag actions">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openConfirmation(flag, 'dismiss')}
                    disabled={isLoading}
                    aria-label={`Dismiss flag for ${formatPlayerName(flag.reported_player_identifier)}`}
                  >
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openConfirmation(flag, 'remove')}
                    disabled={isLoading}
                    aria-label={`Remove incident for ${formatPlayerName(flag.reported_player_identifier)}`}
                  >
                    Remove Incident
                  </Button>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Flag Reason:</p>
                <p className="text-white/90">{flag.flag_reason}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-white/80 mb-1">Incident Description:</p>
                <p className="text-white/90">{flag.incident_description}</p>
              </div>

              <div className="flex gap-4 text-sm text-white/60">
                <span>
                  Reporter: {flag.reporter_display_name || flag.reporter_email || 'Anonymous'}
                </span>
                {flag.flag_resolution && (
                  <span>
                    Resolution: <Badge variant="secondary">{flag.flag_resolution}</Badge>
                  </span>
                )}
              </div>
            </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={selectedFlag !== null} onOpenChange={() => setSelectedFlag(null)}>
        <AlertDialogContent className="bg-gray-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {actionType === 'dismiss' ? 'Dismiss Flag' : 'Remove Incident'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              {actionType === 'dismiss'
                ? 'This will mark the flag as reviewed without taking action on the incident.'
                : 'This will remove the incident from public view. This action affects the reported player\'s reputation.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 text-white border-white/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedFlag && actionType) {
                  handleAction(
                    selectedFlag.flag_id,
                    actionType === 'dismiss' ? 'dismissed' : 'removed_incident'
                  );
                }
              }}
              className={actionType === 'remove' ? 'bg-red-600 hover:bg-red-700' : ''}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
