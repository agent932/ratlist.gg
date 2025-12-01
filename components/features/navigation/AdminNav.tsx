'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

type NavItem = {
  label: string;
  href: string;
  requiresAdmin?: boolean;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', requiresAdmin: true },
  { label: 'Flag Queue', href: '/moderator/flags' },
  { label: 'Users', href: '/admin/users', requiresAdmin: true },
  { label: 'Audit Logs', href: '/admin/audit', requiresAdmin: true },
];

export function AdminNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  const filteredItems = navItems.filter(
    (item) => !item.requiresAdmin || isAdmin
  );

  return (
    <nav className="border-b border-white/10 bg-black/30 backdrop-blur-sm mb-8" aria-label="Admin navigation">
      <div className="container mx-auto px-4">
        <div className="flex gap-6">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'py-4 px-2 text-sm font-medium transition-colors border-b-2',
                  isActive
                    ? 'text-brand border-brand'
                    : 'text-white/60 border-transparent hover:text-white hover:border-white/20'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
