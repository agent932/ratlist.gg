import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

export function createSupabaseBrowser() {
  return createPagesBrowserClient()
}
