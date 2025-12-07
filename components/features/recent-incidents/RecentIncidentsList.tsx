import { Card } from '@/components/ui/card';
import { formatPlayerName } from '@/lib/utils/player';
import { CATEGORY_COLORS } from '@/lib/constants/colors';

interface RecentIncident {
  id: string;
  reported_player_id: string;
  player_identifier: string;
  player_display_name: string | null;
  category_id: number;
  category_label: string;
  game_name: string;
  description: string;
  created_at: string;
}

interface RecentIncidentsListProps {
  incidents: RecentIncident[];
}

export function RecentIncidentsList({ incidents }: RecentIncidentsListProps) {
  if (!incidents || incidents.length === 0) {
    return <Card className="p-6 text-center text-slate-500">No recent incidents</Card>;
  }

  return (
    <div className="space-y-4" role="list" aria-label="Recent incidents">
      {incidents.map((incident) => {
        // Map game name to slug (handle cases where game_name might be undefined)
        const gameSlug = incident.game_name 
          ? incident.game_name.toLowerCase().replace(/\s+/g, '-')
          : 'unknown';
        
        return (
          <div key={incident.id} role="listitem" aria-label={`Incident report for ${formatPlayerName(incident.player_display_name || incident.player_identifier)} in ${incident.game_name}`}>
            <Card className="p-4 sm:p-5 border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-white/40">{incident.game_name || 'Unknown Game'}</span>
                <span className="text-white/20">•</span>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[incident.category_label as keyof typeof CATEGORY_COLORS] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                  {incident.category_label}
                </span>
                <span className="text-white/20">•</span>
                <a 
                  href={`/player/${gameSlug}/${encodeURIComponent(formatPlayerName(incident.player_identifier))}`}
                  className="text-sm font-semibold text-white/90 hover:text-brand transition-colors"
                >
                  {formatPlayerName(incident.player_display_name || incident.player_identifier)}
                </a>
              </div>
              <span className="text-xs text-white/40 whitespace-nowrap">
                {new Date(incident.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <p className="text-white/80 leading-relaxed">{incident.description}</p>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
