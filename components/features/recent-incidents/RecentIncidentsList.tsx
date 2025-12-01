import { Card } from '@/components/ui/card';

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

  const categoryColors: Record<string, string> = {
    'Betrayal': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Toxicity': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Scamming': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'Teaming': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Cheating': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    'Positive': 'bg-green-500/10 text-green-400 border-green-500/20',
  };

  return (
    <div className="space-y-4">
      {incidents.map((incident) => {
        // Map game name to slug (handle cases where game_name might be undefined)
        const gameSlug = incident.game_name 
          ? incident.game_name.toLowerCase().replace(/\s+/g, '-')
          : 'unknown';
        
        return (
          <Card key={incident.id} className="p-4 sm:p-5 border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-white/40">{incident.game_name || 'Unknown Game'}</span>
                <span className="text-white/20">•</span>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${categoryColors[incident.category_label] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                  {incident.category_label}
                </span>
                <span className="text-white/20">•</span>
                <a 
                  href={`/player/${gameSlug}/${encodeURIComponent(incident.player_identifier)}`}
                  className="text-sm font-semibold text-white/90 hover:text-brand transition-colors"
                >
                  {incident.player_display_name || incident.player_identifier}
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
        );
      })}
    </div>
  );
}
