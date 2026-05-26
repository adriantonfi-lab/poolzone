// app/api/payments/deposit/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { userId, amount, paymentMethod, proofImage, notes } = await req.json()

    if (!userId || !amount || !paymentMethod || !proofImage) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    if (amount < 5) {
      return NextResponse.json({ error: 'El mínimo es $5' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Guardar comprobante en payment_proofs
    const { error } = await supabase.from('payment_proofs').insert({
      user_id: userId,
      amount,
      payment_method: paymentMethod,
      proof_image: proofImage,
      notes,
      status: 'pending',
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Notificar a los admins
    try {
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['admin', 'super_admin'])

      const adminIds = admins?.map(a => a.id) || []

      if (adminIds.length > 0) {
        const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://poolzone-final.vercel.app'
        fetch(`${BASE_URL}/api/push/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'credits',
            title: '💰 Nuevo comprobante de pago',
            body: `Pago de $${amount} por ${paymentMethod} esperando aprobación`,
            url: '/admin',
            userIds: adminIds,
          }),
        })
      }
    } catch {}

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Deposit error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
