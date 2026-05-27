// app/api/admin/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      action, userId, matchId, homeScore, awayScore, 
      targetId, newRole, targetUserId,
      // Nivel 3: goles por tiempo
      homeFirstHalf, awayFirstHalf, homeSecondHalf, awaySecondHalf,
      // Nivel 4: penales
      homePenalties, awayPenalties,
    } = body

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
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
      // Guardar resultado en el partido
      await supabase.from('matches').update({
        home_score: homeScore,
        away_score: awayScore,
        status: 'finished',
        // Guardar datos de tiempos si se proporcionan
        ...(homeFirstHalf !== undefined && {
          home_first_half_score: homeFirstHalf,
          away_first_half_score: awayFirstHalf,
          home_second_half_score: homeSecondHalf,
          away_second_half_score: awaySecondHalf,
        }),
        ...(homePenalties !== undefined && {
          home_penalties: homePenalties,
          away_penalties: awayPenalties,
        }),
      }).eq('id', matchId)

      const { data: preds } = await supabase
        .from('predictions')
        .select('*')
        .eq('match_id', matchId)

      const { data: match } = await supabase
        .from('matches')
        .select('home_team, away_team, stage')
        .eq('id', matchId)
        .single()

      if (!match) return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 })

      // Determinar ganador real
      let realWinner = 'Empate'
      if (homeScore > awayScore) realWinner = match.home_team
      if (awayScore > homeScore) realWinner = match.away_team

      // Determinar ganador por penales (eliminatorias)
      let penaltyWinner = null
      if (homePenalties !== undefined && homePenalties !== null) {
        penaltyWinner = homePenalties > awayPenalties ? match.home_team : match.away_team
      }

      // Es partido 0-0?
      const isZeroZero = homeScore === 0 && awayScore === 0

      // Es fase eliminatoria?
      const isKnockout = match.stage !== 'Group Stage'

      for (const pred of preds || []) {
        let points = 0

        // ============================================
        // MULTIPLICADOR POR FEE TARDÍO
        // Gratis +24hs → 100%
        // $2 menos 24hs → 75%
        // $3 15min antes → 50%  
        // $5 5min antes → 25%
        // ============================================
        let mult = 1
        if (pred.late_fee === 2) mult = 0.75
        else if (pred.late_fee === 3) mult = 0.50
        else if (pred.late_fee === 5) mult = 0.25

        // ============================================
        // NIVEL 1: Ganador — 20 pts
        // ============================================
        const nivel1 = pred.predicted_winner === realWinner

        if (nivel1) points += 20

        // ============================================
        // REGLA ESPECIAL 0-0:
        // Si el partido termina 0-0, solo cobra Nivel 1
        // No se calculan Niveles 2, 3 ni 4
        // ============================================
        if (!isZeroZero) {

          // ============================================
          // NIVEL 2: Marcador exacto — 25 pts
          // ============================================
          if (
            pred.predicted_home_score === homeScore && 
            pred.predicted_away_score === awayScore
          ) {
            points += 25
          }

          // ============================================
          // NIVEL 3: Goles por tiempo — 15 pts
          // Solo si el admin cargó los datos de tiempos
          // ============================================
          if (homeFirstHalf !== undefined && homeFirstHalf !== null) {
            const nivel3 = 
              pred.predicted_first_half_goals !== null &&
              pred.predicted_second_half_goals !== null &&
              // Primer tiempo: goles local
              Math.floor(pred.predicted_first_half_goals / 10) === homeFirstHalf &&
              // Primer tiempo: goles visitante  
              (pred.predicted_first_half_goals % 10) === awayFirstHalf

            if (nivel3) points += 15
          }

          // ============================================
          // NIVEL 4: Penales — 10 pts (solo eliminatorias)
          // ============================================
          if (isKnockout && penaltyWinner && pred.predicted_penalties !== null) {
            if (pred.predicted_penalties === penaltyWinner) {
              points += 10
            }
          }
        }

        const finalPoints = Math.round(points * mult)

        await supabase.from('predictions').update({
          points_earned: finalPoints,
          is_correct: nivel1,
        }).eq('id', pred.id)
      }

      // Notificar goles a todos los usuarios
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://poolzone-final.vercel.app'
        const scoreStr = `${homeScore}-${awayScore}`
        fetch(`${BASE_URL}/api/push/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'result',
            title: 'Resultado final 🏆',
            body: `${match.home_team} ${scoreStr} ${match.away_team}`,
            url: '/schedule',
            broadcast: true,
          }),
        })
      } catch {}

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
