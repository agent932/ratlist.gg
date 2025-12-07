'use client'

import { Button } from '@/components/ui/button'
import { PlayerSearchAutocomplete } from './PlayerSearchAutocomplete'

interface HeroProps {
  stats: {
    incidents: number
    players: number
    users: number
  }
}

export function Hero({ stats }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand/10 via-transparent to-transparent" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px),
                           linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem'
        }} />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-20" />

      <div className="container relative py-24 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand"></span>
            </span>
            Community-Driven Reputation System
          </div>

          {/* Main heading with gradient */}
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Know Your Team.
            </span>
            <br />
            <span className="bg-gradient-to-r from-brand via-purple-400 to-brand bg-clip-text text-transparent">
              Trust the Ratlist.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Community incident board and reputation lookup for extraction shooters. 
            Report suspicious players, track incidents, and make informed decisions.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild className="w-full sm:w-auto bg-brand hover:bg-brand/90 text-brand-foreground font-semibold px-8 py-6 text-lg">
              <a href="/report">Report an Incident</a>
            </Button>
            <a 
              className="w-full sm:w-auto rounded-lg border border-white/20 bg-white/5 px-8 py-6 text-lg font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm" 
              href="/browse"
            >
              Browse the Ratlist
            </a>
          </div>

          {/* Search box */}
          <div className="mt-16">
            <PlayerSearchAutocomplete />
            <p className="mt-3 text-sm text-white/40">
              Start typing to see player suggestions
            </p>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-3 sm:gap-8 max-w-2xl mx-auto">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-bold text-brand">{stats.incidents.toLocaleString()}</div>
              <div className="mt-1 text-xs sm:text-sm text-white/60">Reports Filed</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-bold text-brand">{stats.players.toLocaleString()}</div>
              <div className="mt-1 text-xs sm:text-sm text-white/60">Players Tracked</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-bold text-brand">{stats.users.toLocaleString()}</div>
              <div className="mt-1 text-xs sm:text-sm text-white/60">Active Users</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
