// T006: DashboardLayout component - Sidebar navigation
'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  FileText, 
  Flag, 
  AlertTriangle, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, tab: null },
  { id: 'linked-players', label: 'Linked Players', icon: LinkIcon, tab: 'linked-players' },
  { id: 'my-reports', label: 'My Reports', icon: FileText, tab: 'my-reports' },
  { id: 'my-flags', label: 'My Flags', icon: Flag, tab: 'my-flags' },
  { id: 'reports-against-me', label: 'Reports Against Me', icon: AlertTriangle, tab: 'reports-against-me' },
  { id: 'settings', label: 'Settings', icon: Settings, tab: 'settings' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || null;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full border-white/20 hover:bg-white/5"
              aria-label={mobileMenuOpen ? "Close dashboard menu" : "Open dashboard menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-4 w-4 mr-2" /> : <Menu className="h-4 w-4 mr-2" />}
              {mobileMenuOpen ? 'Close Menu' : 'Dashboard Menu'}
            </Button>
          </div>

          {/* Sidebar */}
          <aside
            className={`
              lg:block lg:w-64 flex-shrink-0
              ${mobileMenuOpen ? 'block' : 'hidden'}
            `}
          >
            <div className="sticky top-24">
              <nav className="space-y-1" aria-label="Dashboard navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.tab === activeTab;
                  
                  return (
                    <Link
                      key={item.id}
                      href={item.tab ? `/dashboard?tab=${item.tab}` : '/dashboard'}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                        ${
                          isActive
                            ? 'bg-brand text-brand-foreground font-semibold'
                            : 'text-white/80 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0" role="main" aria-label="Dashboard content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
