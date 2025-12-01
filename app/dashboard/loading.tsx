// Loading state for dashboard
import { Card } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="space-y-1">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-white/5 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </aside>

          {/* Main content skeleton */}
          <main className="flex-1">
            <div className="space-y-6">
              <div className="h-8 bg-white/10 rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-white/10 rounded w-1/4 animate-pulse" />
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card
                    key={i}
                    className="p-6 border-white/10 bg-white/5 animate-pulse"
                  >
                    <div className="h-4 bg-white/10 rounded mb-2" />
                    <div className="h-8 bg-white/10 rounded" />
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
