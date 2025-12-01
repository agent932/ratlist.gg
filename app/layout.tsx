import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Ratlist.gg',
  description: 'Community incident board for extraction shooters',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <header className="sticky top-0 z-40 border-b border-white/5 bg-black/50 backdrop-blur">
          <div className="container flex h-14 items-center justify-between">
            <a href="/" className="text-lg font-semibold">Ratlist.gg</a>
            <nav className="flex gap-4 text-sm">
              <a href="/browse" className="hover:text-brand">Browse</a>
              <a href="/games" className="hover:text-brand">Games</a>
              <a href="/faq" className="hover:text-brand">FAQ</a>
              <a href="/report" className="rounded bg-brand px-3 py-1.5 text-brand-foreground hover:opacity-90">Report</a>
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        <footer className="border-t border-white/5 py-8 text-sm opacity-80">
          <div className="container space-y-2">
            <p>
              Ratlist.gg is a community-run informational site. It is not affiliated with or endorsed by any game studio.
            </p>
            <p>
              All incidents are user-generated opinions. Use as context, not proof. No harassment, doxxing, or targeted abuse.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
