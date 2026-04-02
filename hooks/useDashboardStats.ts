import { useQuery } from '@tanstack/react-query'

export interface DashboardStats {
  linked_players_count: number
  incidents_submitted_count: number
  flags_submitted_count: number
  reports_against_me_count: number
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/dashboard/stats')
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats')
  }
  return response.json()
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
  })
}
