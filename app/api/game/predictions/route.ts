// app/api/my-picks/route.ts
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
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Verificar partido
    const { data: match } = await supabase
      .from('matches')
      .select('match_date, status')
      .eq('id', match_id)
      .single()

    if (!match) return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 })

    const now = Date.now()
    const kickoff = new Date(match.match_date).getTime()
    const minsPassed = (now - kickoff) / 60000
    const minsLeft = (kickoff - now) / 60000

    // Bloqueado si el partido ya empezó y no es entretiempo
    if (minsPassed > 0 && !(minsPassed >= 45 && minsPassed <= 65)) {
      return NextResponse.json({ error: 'No se puede modificar — partido en curso' }, { status: 403 })
    }

    // Verificar si ya tiene una predicción (modificación = cobra fee)
    const { data: existingPred } = await supabase
      .from('predictions')
      .select('id, late_fee')
      .eq('user_id', userId)
      .eq('match_id', match_id)
      .single()

    const isModification = !!existingPred

    // Calcular fee según tiempo restante (solo si es modificación)
    let feeAmount = 0
    let feeCredits = 0

    if (isModification) {
      if (minsLeft <= 5) {
        feeAmount = 5
        feeCredits = 50  // $5 = 50 créditos
      } else if (minsLeft <= 15) {
        feeAmount = 3
        feeCredits = 30  // $3 = 30 créditos
      } else if (minsLeft <= 1440) { // menos de 24hs
        feeAmount = 2
        feeCredits = 20  // $2 = 20 créditos
      }
      // más de 24hs = gratis
    }

    // Si hay fee, verificar y descontar créditos
    if (feeCredits > 0) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()

      if (!profile) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

      if (profile.credits < feeCredits) {
        return NextResponse.json({ 
          error: `Necesitás $${feeAmount} en créditos para modificar esta predicción. Tenés $${(profile.credits / 10).toFixed(2)}`,
          feeRequired: feeAmount,
        }, { status: 402 })
      }

      // Descontar créditos
      const newCredits = profile.credits - feeCredits
      await supabase.from('profiles').update({ credits: newCredits }).eq('id', userId)

      // Registrar transacción
      await supabase.from('credit_transactions').insert({
        user_id: userId,
        amount: -feeCredits,
        type: 'late_fee',
        description: `⏰ Fee por modificación tardía — $${feeAmount} (${minsLeft.toFixed(0)} min antes del partido)`,
        balance_after: newCredits,
        status: 'completed',
      })
    }

    // Guardar predicción
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
        late_fee: feeAmount, // guardar el fee real cobrado
        filled_at: new Date().toISOString(),
      }, { onConflict: 'user_id,match_id' })

    if (error) {
      console.error('Prediction error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      feeCharged: feeAmount,
      isModification,
      message: feeAmount > 0 
        ? `Predicción actualizada — se cobraron $${feeAmount} por modificación tardía`
        : 'Predicción guardada'
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
