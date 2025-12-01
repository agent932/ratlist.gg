// M009: Flag queue page for moderators
import { redirect } from 'next/navigation';
import { requireModerator } from '@/lib/auth/guards';
import { createSupabaseServer } from '@/lib/supabase/server';
import { FlagQueueTable } from '@/components/features/moderation/FlagQueueTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'Flag Queue | Moderation',
  description: 'Review and moderate flagged content',
};

async function getFlagQueue(status: string = 'open') {
  const supabase = createSupabaseServer();
  
  const { data, error } = await supabase.rpc('fn_get_flag_queue', {
    status_filter: status,
    lim: 50,
  });

  if (error) {
    console.error('Error fetching flag queue:', error);
    return [];
  }

  return data || [];
}

export default async function FlagQueuePage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  try {
    await requireModerator();
  } catch (error) {
    redirect('/');
  }

  const activeTab = searchParams.tab || 'open';
  const flags = await getFlagQueue(activeTab);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Flag Queue</h1>
        <p className="text-white/60">Review and moderate flagged incidents</p>
      </div>

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="open">
            Open ({flags.filter((f: any) => f.flag_status === 'open').length})
          </TabsTrigger>
          <TabsTrigger value="closed">Reviewed</TabsTrigger>
          <TabsTrigger value="all">All Flags</TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          <FlagQueueTable flags={flags.filter((f: any) => f.flag_status === 'open')} />
        </TabsContent>

        <TabsContent value="closed">
          <FlagQueueTable flags={flags.filter((f: any) => f.flag_status === 'closed')} />
        </TabsContent>

        <TabsContent value="all">
          <FlagQueueTable flags={flags} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
