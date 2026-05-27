// app/api/payments/checkout/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { userId, email } = await req.json()
    if (!userId || !email) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })

    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://poolzone.app'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PoolZone — World Cup 2026',
              description: 'Inscripción completa + $5 en créditos para usar en la plataforma',
              images: [`${BASE_URL}/poolzone-icon.png`],
            },
            unit_amount: 3000, // $30.00
          },
          quantity: 1,
        },
      ],
      metadata: { userId },
      success_url: `${BASE_URL}/join/success?session_id={CHECKOUT_SESSION_ID}&userId=${userId}`,
      cancel_url: `${BASE_URL}/register?cancelled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Error al crear sesión de pago' }, { status: 500 })
  }
}
