// T007: Main dashboard page
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/guards';
import { DashboardLayout } from '@/components/features/dashboard/DashboardLayout';
import { DashboardOverview } from '@/components/features/dashboard/DashboardOverview';
import { LinkedPlayersSection } from '@/components/features/dashboard/LinkedPlayersSection';
import { MyIncidentsSection } from '@/components/features/dashboard/MyIncidentsSection';
import { MyFlagsSection } from '@/components/features/dashboard/MyFlagsSection';
import { ReportsAgainstMeSection } from '@/components/features/dashboard/ReportsAgainstMeSection';
import { AccountSettingsSection } from '@/components/features/dashboard/AccountSettingsSection';

export const metadata = {
  title: 'Dashboard | Ratlist.gg',
  description: 'Manage your account, linked players, and activity',
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  try {
    await requireAuth();
  } catch (error) {
    redirect('/auth/sign-in');
  }

  const tab = searchParams.tab;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {!tab ? 'Dashboard' : getTabTitle(tab)}
          </h1>
          <p className="text-white/60">
            {!tab ? 'Welcome to your personal dashboard' : getTabDescription(tab)}
          </p>
        </div>

        {!tab && <DashboardOverview />}
        
        {tab === 'linked-players' && <LinkedPlayersSection />}
        
        {tab === 'my-reports' && <MyIncidentsSection />}
        
        {tab === 'my-flags' && <MyFlagsSection />}
        
        {tab === 'reports-against-me' && <ReportsAgainstMeSection />}
        
        {tab === 'settings' && <AccountSettingsSection />}
      </div>
    </DashboardLayout>
  );
}

function getTabTitle(tab: string): string {
  const titles: Record<string, string> = {
    'linked-players': 'Linked Players',
    'my-reports': 'My Reports',
    'my-flags': 'My Flags',
    'reports-against-me': 'Reports Against Me',
    'settings': 'Account Settings',
  };
  return titles[tab] || 'Dashboard';
}

function getTabDescription(tab: string): string {
  const descriptions: Record<string, string> = {
    'linked-players': 'Manage your linked player IDs across games',
    'my-reports': 'View and track incidents you\'ve submitted',
    'my-flags': 'Review flags you\'ve submitted on incidents',
    'reports-against-me': 'Monitor incidents reported against your linked players',
    'settings': 'Manage your account preferences and notifications',
  };
  return descriptions[tab] || 'Manage your account and activity';
}
