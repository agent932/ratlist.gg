import { Card } from '../../ui/card'

export function FeatureCards() {
  const items = [
    { title: "Check a player", desc: "Look up reputation and recent incidents before teaming up.", href: "/" },
    { title: "Log an incident", desc: "Share notable encounters: betrayals, griefing, clutch saves.", href: "/report" },
    { title: "Browse the ratlist", desc: "See notorious players and trending incidents.", href: "/browse" },
  ]
  return (
    <section className="container pb-16">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Card key={it.title}>
            <h3 className="text-lg font-semibold">{it.title}</h3>
            <p className="mt-2 text-sm text-white/80">{it.desc}</p>
            <a className="mt-4 inline-block text-brand hover:underline" href={it.href}>
              Explore →
            </a>
          </Card>
        ))}
      </div>
    </section>
  )
}
