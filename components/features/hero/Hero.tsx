import { Button } from '../../ui/button'
import { Input } from '../../ui/input'

export function Hero() {
  return (
    <section className="container py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Ratlist.gg</h1>
        <p className="mt-4 text-balance text-white/80">
          Community incident board and reputation lookup for extraction shooters.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild>
            <a href="/report">Report an incident</a>
          </Button>
          <a className="rounded border border-white/10 px-4 py-2 hover:bg-white/5" href="/browse">
            Browse the ratlist
          </a>
        </div>
        <div className="mt-10">
          <form action="/player/tarkov" className="mx-auto flex max-w-xl items-center gap-2">
            <Input name="playerId" placeholder="Search player identifier..." />
            <button className="rounded bg-white/10 px-3 py-2 hover:bg-white/20" type="submit">Search</button>
          </form>
        </div>
      </div>
    </section>
  )
}
