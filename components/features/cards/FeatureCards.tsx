import { Card } from '../../ui/card'

export function FeatureCards() {
  const features = [
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Track Reputation',
      description: 'See player history across games. Make informed decisions about who to trust.',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: 'Community Driven',
      description: 'Built by players, for players. Every report helps the community stay informed.',
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Instant Updates',
      description: 'Real-time incident reporting. Know about suspicious behavior as it happens.',
      gradient: 'from-orange-500/20 to-red-500/20'
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Leaderboards',
      description: 'See who the most reported players are. Filter by game and time period.',
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Privacy First',
      description: 'Your reports can be anonymous. We protect reporter privacy by default.',
      gradient: 'from-indigo-500/20 to-violet-500/20'
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      title: 'Multi-Game Support',
      description: 'Tarkov, Dark and Darker, and more. One platform for all extraction shooters.',
      gradient: 'from-yellow-500/20 to-amber-500/20'
    }
  ]

  return (
    <section className="container py-24 relative">
      {/* Section header */}
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Why Use <span className="text-brand">Ratlist.gg</span>?
        </h2>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          The most comprehensive player reputation system for extraction shooters
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, idx) => (
          <Card 
            key={idx} 
            className="group relative overflow-hidden border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            {/* Content */}
            <div className="relative">
              <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-brand/10 p-3 text-brand">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{feature.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-20 text-center">
        <div className="inline-flex flex-col sm:flex-row gap-4 items-center justify-center">
          <a 
            href="/report" 
            className="w-full sm:w-auto rounded-lg bg-brand hover:bg-brand/90 px-8 py-4 font-semibold text-brand-foreground transition-colors"
          >
            Get Started - Report Now
          </a>
          <a 
            href="/faq" 
            className="w-full sm:w-auto rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 px-8 py-4 font-semibold transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  )
}
