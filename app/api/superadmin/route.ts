import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, paymentId, userId, amount, matchId, title, description, prizeAmount, bonusPoints } = body

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zjlaabrqfjtvbtbvoaic.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_91nbyjNN23_30hYuUXeyNQ_60A4zdiF'
    )

    if (action === 'approve_payment') {
      // Aprobar comprobante
      await supabase.from('payment_proofs').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', paymentId)

      // Actualizar estado de inscripción
      await supabase.from('profiles').update({ inscription_status: 'paid' }).eq('id', userId)

      // Registrar transacción
      const { data: profile } = await supabase.from('profiles').select('credits').eq('id', userId).single()
      await supabase.from('credit_transactions').insert({
        user_id: userId,
        amount: -amount,
        type: 'inscription',
        description: `🎫 Inscripción Mundial 2026 — $${amount}`,
        balance_after: profile?.credits || 0,
      })

      return NextResponse.json({ success: true })
    }

    if (action === 'create_challenge') {
      // Obtener usuario del header
      const authHeader = req.headers.get('authorization')
      let createdBy = null
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user } } = await createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        ).auth.getUser(token)
        createdBy = user?.id
      }

      const { error } = await supabase.from('challenges').insert({
        match_id: matchId,
        title,
        description,
        prize_amount: prizeAmount,
        prize_type: prizeAmount > 0 ? 'cash' : 'points',
        bonus_points: bonusPoints,
        created_by: createdBy,
        status: 'active',
      })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
