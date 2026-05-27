// app/api/payments/confirm/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { sessionId, userId } = await req.json()
    if (!sessionId || !userId) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Pago no completado' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verificar que no se procesó antes
    const { data: existing } = await supabase
      .from('payment_proofs')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .single()

    if (existing) return NextResponse.json({ success: true, credits: 50, already: true })

    // Acreditar créditos y aprobar inscripción
    const INSCRIPTION_CREDITS = 50 // $5 en créditos
    const POOL_AMOUNT = 20 // $20 al pozo

    await supabase.from('profiles').update({
      credits: INSCRIPTION_CREDITS,
      inscription_status: 'paid',
      base_points: 100,
    }).eq('id', userId)

    // Registrar pago
    await supabase.from('payment_proofs').insert({
      user_id: userId,
      amount: 30,
      payment_method: 'stripe',
      status: 'approved',
      notes: `Stripe session: ${sessionId}`,
      approved_at: new Date().toISOString(),
    })

    // Registrar transacción de créditos
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: INSCRIPTION_CREDITS,
      type: 'inscription',
      description: `🎉 Inscripción Mundial 2026 — $5 en créditos de bienvenida`,
      balance_after: INSCRIPTION_CREDITS,
      status: 'completed',
    })

    // Notificar al admin
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://poolzone.app'
      const { data: admins } = await supabase.from('profiles').select('id').in('role', ['admin', 'super_admin'])
      if (admins?.length) {
        fetch(`${BASE_URL}/api/push/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'credits',
            title: '💰 Nueva inscripción',
            body: `Pago de $30 confirmado por Stripe`,
            url: '/admin',
            userIds: admins.map(a => a.id),
          }),
        })
      }
    } catch {}

    return NextResponse.json({ success: true, credits: INSCRIPTION_CREDITS })
  } catch (err) {
    console.error('Payment confirm error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
