import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function main() {
  const sql = readFileSync('apply_function_fix.sql', 'utf-8')
  
  console.log('Executing SQL...')
  const { data, error } = await supabase.rpc('exec', { sql })
  
  if (error) {
    console.error('Error:', error)
    process.exit(1)
  }
  
  console.log('Success!', data)
}

main()
