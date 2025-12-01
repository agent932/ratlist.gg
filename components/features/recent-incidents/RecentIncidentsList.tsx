import { Card } from '@/components/ui/card';

interface RecentIncident {
  id: string;
  reported_player_id: string;
  player_identifier: string;
  player_display_name: string | null;
  category_id: number;
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
    <div className="space-y-4">
      {incidents.map((incident) => (
        <Card key={incident.id} className="p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-slate-300">
              {incident.player_display_name || incident.player_identifier}
            </p>
            <p className="text-sm text-slate-400">
              {new Date(incident.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
          <p className="text-slate-200">{incident.description}</p>
        </Card>
      ))}
    </div>
  );
}
