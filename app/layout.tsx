import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { Header } from '../components/layout/Header'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Ratlist.gg',
  description: 'Community incident board for extraction shooters',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-V9XRQYPDQE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-V9XRQYPDQE');
          `}
        </Script>
        
        <Header />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl py-12">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-3 mb-8">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Ratlist.gg
                </h3>
                <p className="text-sm text-white/60">
                  Community-driven reputation system for extraction shooters
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Quick Links</h3>
                <ul className="space-y-2 text-sm text-white/60">
                  <li><a href="/browse" className="hover:text-brand transition-colors">Browse Reports</a></li>
                  <li><a href="/games" className="hover:text-brand transition-colors">Supported Games</a></li>
                  <li><a href="/faq" className="hover:text-brand transition-colors">FAQ</a></li>
                  <li><a href="/report" className="hover:text-brand transition-colors">Report Incident</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Legal</h3>
                <ul className="space-y-2 text-sm text-white/60">
                  <li><a href="/terms" className="hover:text-brand transition-colors">Terms of Service</a></li>
                  <li><a href="/privacy" className="hover:text-brand transition-colors">Privacy Policy</a></li>
                  <li><a href="/guidelines" className="hover:text-brand transition-colors">Community Guidelines</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-8 space-y-3 text-sm text-white/60">
              <p>
                Ratlist.gg is a community-run informational site. It is not affiliated with or endorsed by any game studio.
              </p>
              <p>
                All incidents are user-generated opinions. Use as context, not proof. No harassment, doxxing, or targeted abuse.
              </p>
              <p className="text-white/40">
                © 2025 Ratlist.gg. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
