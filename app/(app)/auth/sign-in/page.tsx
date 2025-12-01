'use client'

import { createSupabaseBrowser } from '../../../../lib/supabase/client'
import { useState } from 'react'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'

export default function SignInPage() {
  const supabase = createSupabaseBrowser()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (!error) setSent(true)
    // TODO: show toast on error
  }

  return (
    <section className="container max-w-md py-16">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <div className="mt-6 space-y-3">
        <form onSubmit={signInWithEmail} className="flex items-center gap-2">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit">{sent ? 'Link sent' : 'Email link'}</Button>
        </form>
        <div className="flex gap-2">
          <Button onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })}>GitHub</Button>
          <Button onClick={() => supabase.auth.signInWithOAuth({ provider: 'discord' })}>Discord</Button>
        </div>
      </div>
    </section>
  )
}
