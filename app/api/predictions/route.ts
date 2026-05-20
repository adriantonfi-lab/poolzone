import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      userId, match_id, predicted_winner,
      predicted_home_score, predicted_away_score,
      predicted_scorers, predicted_first_half_goals,
      predicted_second_half_goals, predicted_penalties,
      late_fee
    } = body

    if (!userId || !match_id || !predicted_winner) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zjlaabrqfjtvbtbvoaic.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_91nbyjNN23_30hYuUXeyNQ_60A4zdiF'
    )

    // Verificar que el partido no empezó (excepto entretiempo)
    const { data: match } = await supabase
      .from('matches')
      .select('match_date, status')
      .eq('id', match_id)
      .single()

    if (!match) return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 })

    const now = Date.now()
    const kickoff = new Date(match.match_date).getTime()
    const minsPassed = (now - kickoff) / 60000

    // Bloqueado si el partido ya empezó y no es entretiempo
    if (minsPassed > 0 && !(minsPassed >= 45 && minsPassed <= 65)) {
      return NextResponse.json({ error: 'No se puede modificar — partido en curso' }, { status: 403 })
    }

    // Upsert predicción
    const { error } = await supabase
      .from('predictions')
      .upsert({
        user_id: userId,
        match_id,
        predicted_winner,
        predicted_home_score,
        predicted_away_score,
        predicted_scorers,
        predicted_first_half_goals,
        predicted_second_half_goals,
        predicted_penalties,
        late_fee,
        filled_at: new Date().toISOString(),
      }, { onConflict: 'user_id,match_id' })

    if (error) {
      console.error('Prediction error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
