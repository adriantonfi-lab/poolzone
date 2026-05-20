import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, userId, matchId, homeScore, awayScore, targetId, newRole, targetUserId } = body

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zjlaabrqfjtvbtbvoaic.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    const { data: caller } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (!caller || !['super_admin', 'admin'].includes(caller.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const isSuperAdmin = caller.role === 'super_admin'

    if (action === 'save_result') {
      await supabase.from('matches').update({
        home_score: homeScore,
        away_score: awayScore,
        status: 'finished',
      }).eq('id', matchId)

      const { data: preds } = await supabase
        .from('predictions')
        .select('*')
        .eq('match_id', matchId)

      const { data: match } = await supabase
        .from('matches')
        .select('home_team, away_team')
        .eq('id', matchId)
        .single()

      if (!match) return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 })

      let realWinner = 'Empate'
      if (homeScore > awayScore) realWinner = match.home_team
      if (awayScore > homeScore) realWinner = match.away_team

      for (const pred of preds || []) {
        let points = 0
        const mult = pred.late_fee > 0 ?
          pred.late_fee === 2 ? 0.75 :
          pred.late_fee === 5 ? 0.5 :
          pred.late_fee === 8 ? 0.25 : 1 : 1

        // Nivel 1: ganador — 20 pts
        if (pred.predicted_winner === realWinner) points += 20

        // Nivel 2: marcador exacto — 25 pts
        if (pred.predicted_home_score === homeScore && pred.predicted_away_score === awayScore) points += 25

        // Nivel 3: goles por tiempo — 15 pts (se calcula cuando se carguen los datos de tiempo)
        // Por ahora se suma si los campos están cargados y son correctos
        // (requiere home_first_half_score y away_first_half_score en la tabla matches)

        const finalPoints = Math.round(points * mult)

        await supabase.from('predictions').update({
          points_earned: finalPoints,
          is_correct: pred.predicted_winner === realWinner,
        }).eq('id', pred.id)
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'generate_code') {
      if (!isSuperAdmin) return NextResponse.json({ error: 'Solo el super admin puede generar códigos' }, { status: 403 })
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      return NextResponse.json({ success: true, code })
    }

    if (action === 'change_role') {
      if (!isSuperAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
      await supabase.from('profiles').update({ role: newRole }).eq('id', targetId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
