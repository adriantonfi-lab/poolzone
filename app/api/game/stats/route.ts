import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { count: players } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .in('inscription_status', ['paid', 'approved'])

    const pot = (players || 0) * 20

    return NextResponse.json({ players: players || 0, pot })
  } catch {
    return NextResponse.json({ players: 0, pot: 0 })
  }
}
