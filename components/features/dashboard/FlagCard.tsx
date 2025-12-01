// T003: Reusable FlagCard component for dashboard
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { formatPlayerName } from '@/lib/utils/player';
import { RESOLUTION_COLORS } from '@/lib/constants/colors';

interface FlagCardProps {
  flag: {
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
  };
}

export function FlagCard({ flag }: FlagCardProps) {
  const resolutionColor = RESOLUTION_COLORS[flag.resolution as keyof typeof RESOLUTION_COLORS] || RESOLUTION_COLORS.open;

  return (
    <Card className="p-4 border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="border-brand/30 text-brand">
                {flag.game_name}
              </Badge>
              <Link
                href={`/player/${flag.game_slug}/${flag.player_id}`}
                className="text-white hover:text-brand transition-colors font-semibold"
              >
                {formatPlayerName(flag.player_id)}
              </Link>
            </div>
          </div>
          <Badge variant="outline" className={resolutionColor}>
            {flag.resolution}
          </Badge>
        </div>

        {/* Incident Info */}
        <div className="flex items-center gap-4 text-sm text-white/60">
          <span className="font-medium text-white/80">{flag.incident_category}</span>
          <span>•</span>
          <span>{new Date(flag.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        {/* Original Incident Description */}
        <div className="text-sm">
          <span className="text-white/60">Flagged Incident: </span>
          <span className="text-white/80 line-clamp-1">{flag.incident_description}</span>
        </div>

        {/* Flag Reason */}
        <div className="pt-2 border-t border-white/10">
          <span className="text-sm font-medium text-white/80">Your Flag Reason:</span>
          <p className="text-sm text-white/60 mt-1">{flag.flag_reason}</p>
        </div>

        {/* Review Info */}
        {flag.reviewed_at && (
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span>Reviewed by {flag.reviewer_name || 'Moderator'}</span>
              <span>•</span>
              <span>{new Date(flag.reviewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            {flag.moderator_notes && (
              <div className="mt-2">
                <span className="text-sm font-medium text-white/80">Moderator Notes:</span>
                <p className="text-sm text-white/60 mt-1">{flag.moderator_notes}</p>
              </div>
            )}
          </div>
        )}

        {/* View Incident Link */}
        <div className="pt-2">
          <Link
            href={`/player/${flag.game_slug}/${flag.player_id}#incident-${flag.incident_id}`}
            className="text-sm text-brand hover:text-brand/80 transition-colors"
          >
            View Original Incident →
          </Link>
        </div>
      </div>
    </Card>
  );
}
