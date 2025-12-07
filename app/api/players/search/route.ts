import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    const supabase = createSupabaseServer()

    // Search for players matching the query
    const { data, error } = await supabase
      .from('players')
      .select(`
        identifier,
        display_name,
        incidents:incidents(count)
      `)
      .or(`identifier.ilike.%${query}%,display_name.ilike.%${query}%`)
      .order('identifier', { ascending: true })
      .limit(10)

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json([])
    }

    // Transform the data to include incident count
    const suggestions = data.map((player: any) => ({
      identifier: player.identifier,
      display_name: player.display_name,
      incident_count: player.incidents?.[0]?.count || 0
    }))

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json([])
  }
}
