import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' as any })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    if (!userId) return NextResponse.json({ ok: true })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: existing } = await supabase
      .from('payment_proofs')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .single()

    if (!existing) {
      await supabase.from('profiles').update({
        credits: 50,
        inscription_status: 'paid',
        base_points: 100,
      }).eq('id', userId)

      await supabase.from('payment_proofs').insert({
        user_id: userId,
        amount: 30,
        payment_method: 'stripe',
        status: 'approved',
        notes: `Stripe session: ${session.id}`,
        approved_at: new Date().toISOString(),
      })

      await supabase.from('credit_transactions').insert({
        user_id: userId,
        amount: 50,
        type: 'inscription',
        description: '🎉 PoolZone World Cup 2026 — Welcome credits',
        balance_after: 50,
        status: 'completed',
      })
    }
  }

  return NextResponse.json({ ok: true })
}
