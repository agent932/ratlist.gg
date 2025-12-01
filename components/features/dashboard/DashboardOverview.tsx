// T005: DashboardOverview component - Stats cards and quick actions
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardStats {
  linked_players_count: number;
  incidents_submitted_count: number;
  flags_submitted_count: number;
  reports_against_me_count: number;
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 border-white/10 bg-white/5 animate-pulse">
            <div className="h-4 bg-white/10 rounded mb-2" />
            <div className="h-8 bg-white/10 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="p-6 border-white/10 bg-white/5">
        <p className="text-white/60">Failed to load dashboard stats</p>
      </Card>
    );
  }

  const statCards = [
    {
      label: 'Linked Players',
      value: stats.linked_players_count,
      color: 'text-brand',
      bgColor: 'bg-brand/10',
    },
    {
      label: 'Reports Submitted',
      value: stats.incidents_submitted_count,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      label: 'Flags Submitted',
      value: stats.flags_submitted_count,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
    {
      label: 'Reports Against Me',
      value: stats.reports_against_me_count,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className={`p-6 border-white/10 ${stat.bgColor} transition-all hover:scale-105`}
          >
            <div className="text-sm font-medium text-white/60 mb-2">
              {stat.label}
            </div>
            <div className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6 border-white/10 bg-white/5">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/report">
            <Button className="w-full bg-brand hover:bg-brand/90 text-brand-foreground">
              Submit Report
            </Button>
          </Link>
          <Link href="/dashboard?tab=linked-players">
            <Button variant="outline" className="w-full border-white/20 hover:bg-white/5">
              Link Player ID
            </Button>
          </Link>
          <Link href="/dashboard?tab=my-reports">
            <Button variant="outline" className="w-full border-white/20 hover:bg-white/5">
              View My Reports
            </Button>
          </Link>
          <Link href="/dashboard?tab=my-flags">
            <Button variant="outline" className="w-full border-white/20 hover:bg-white/5">
              View My Flags
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
