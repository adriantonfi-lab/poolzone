// app/api/reenganche/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verificar perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits, reenganche_used, inscription_status')
      .eq('id', userId)
      .single()

    if (!profile) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    // Verificar que no haya usado el re-enganche ya
    if (profile.reenganche_used) {
      return NextResponse.json({ error: 'Ya usaste el re-enganche' }, { status: 400 })
    }

    // Verificar que tenga créditos suficientes ($25 = 250 créditos)
    const REENGANCHE_COST = 250 // $25 en créditos
    const REENGANCHE_POINTS = 50

    if (profile.credits < REENGANCHE_COST) {
      return NextResponse.json({ 
        error: `Necesitás $25 en créditos. Tenés $${(profile.credits / 10).toFixed(2)}` 
      }, { status: 400 })
    }

    // Descontar créditos + marcar re-enganche + sumar 50 puntos base
    const { error } = await supabase
      .from('profiles')
      .update({
        credits: profile.credits - REENGANCHE_COST,
        reenganche_used: true,
        reenganche_points: REENGANCHE_POINTS,
        inscription_status: profile.inscription_status === 'pending' ? 'paid' : profile.inscription_status,
      })
      .eq('id', userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Registrar transacción
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: -REENGANCHE_COST,
      type: 'reenganche',
      description: 'Re-enganche Fase Eliminatoria — +50 puntos base',
      status: 'completed',
    })

    return NextResponse.json({ 
      success: true, 
      message: '¡Re-enganche activado! +50 puntos sumados al ranking',
      pointsAdded: REENGANCHE_POINTS,
    })

  } catch (err) {
    console.error('Reenganche error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
