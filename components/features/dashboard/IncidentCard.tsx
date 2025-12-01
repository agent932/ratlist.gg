// T002: Reusable IncidentCard component for dashboard
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { formatPlayerName } from '@/lib/utils/player';
import { SEVERITY_COLORS, STATUS_COLORS } from '@/lib/constants/colors';

interface IncidentCardProps {
  incident: {
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
  };
  showModerationInfo?: boolean;
}

export function IncidentCard({ incident, showModerationInfo = false }: IncidentCardProps) {
  const severityColor = SEVERITY_COLORS[incident.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.low;
  const statusColor = STATUS_COLORS[incident.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.active;

  return (
    <Card className="p-4 border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="border-brand/30 text-brand">
                {incident.game_name}
              </Badge>
              <Link
                href={`/player/${incident.game_slug}/${incident.player_id}`}
                className="text-white hover:text-brand transition-colors font-semibold"
              >
                {formatPlayerName(incident.player_id)}
              </Link>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Badge variant="outline" className={severityColor}>
              {incident.severity}
            </Badge>
            <Badge variant="outline" className={statusColor}>
              {incident.status}
            </Badge>
            {incident.flagged && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                Flagged
              </Badge>
            )}
          </div>
        </div>

        {/* Category & Date */}
        <div className="flex items-center gap-4 text-sm text-white/60">
          <span className="font-medium text-white/80">{incident.category_name}</span>
          <span>•</span>
          <span>{new Date(incident.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-white/80 line-clamp-2">
          {incident.description}
        </p>

        {/* Moderation Info */}
        {showModerationInfo && incident.moderated_at && (
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span>Moderated by {incident.moderator_name || 'System'}</span>
              <span>•</span>
              <span>{new Date(incident.moderated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            {incident.moderation_reason && (
              <p className="text-sm text-white/60 mt-1">
                Reason: {incident.moderation_reason}
              </p>
            )}
          </div>
        )}

        {/* View Details Link */}
        <div className="pt-2">
          <Link
            href={`/player/${incident.game_slug}/${incident.player_id}#incident-${incident.id}`}
            className="text-sm text-brand hover:text-brand/80 transition-colors"
          >
            View Details →
          </Link>
        </div>
      </div>
    </Card>
  );
}
