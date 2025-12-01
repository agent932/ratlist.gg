import { Card } from '@/components/ui/card';

interface RecentIncident {
  id: string;
  reported_player_id: string;
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
          <p className="text-sm text-slate-400 mb-2">
            {new Date(incident.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p className="text-slate-200">{incident.description}</p>
        </Card>
      ))}
    </div>
  );
}
