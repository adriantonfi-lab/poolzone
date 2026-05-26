// app/api/admin/payments/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const db = supabase()
    const { data: payments, error } = await db
      .from('payment_proofs')
      .select('*, profiles(username, avatar_url)')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ payments })
  } catch (err) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { action, paymentId, userId, adminId, credits } = await req.json()
    const db = supabase()

    // Verificar que el caller es admin
    const { data: admin } = await db.from('profiles').select('role').eq('id', adminId).single()
    if (!admin || !['admin', 'super_admin'].includes(admin.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    if (action === 'approve') {
      // 1. Actualizar estado del pago
      await db.from('payment_proofs').update({
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
      }).eq('id', paymentId)

      // 2. Obtener créditos actuales del usuario
      const { data: profile } = await db.from('profiles').select('credits, inscription_status').eq('id', userId).single()
      const currentCredits = profile?.credits || 0

      // 3. Acreditar créditos
      await db.from('profiles').update({
        credits: currentCredits + credits,
        inscription_status: 'paid',
      }).eq('id', userId)

      // 4. Registrar transacción
      await db.from('credit_transactions').insert({
        user_id: userId,
        amount: credits,
        type: 'admin_credit',
        description: `Pago aprobado por admin — ${credits} créditos`,
        balance_after: currentCredits + credits,
        status: 'completed',
      })

      // 5. Notificación push al usuario
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://che-bacano-final.vercel.app'
        fetch(`${BASE_URL}/api/push/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'credits',
            title: '¡Pago aprobado! 💰',
            body: `Se acreditaron $${credits / 10} en tu wallet`,
            url: '/wallet',
            userIds: [userId],
          }),
        })
      } catch {}

      return NextResponse.json({ success: true })
    }

    if (action === 'reject') {
      await db.from('payment_proofs').update({
        status: 'rejected',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
      }).eq('id', paymentId)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
