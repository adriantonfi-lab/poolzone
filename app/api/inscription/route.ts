import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, code } = body

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_91nbyjNN23_30hYuUXeyNQ_60A4zdiF'
    )

    // Obtener usuario actual desde el header de auth
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ).auth.getUser(token)

    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    if (action === 'apply_referral') {
      // Buscar el código
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id, username, referrals_count')
        .eq('referral_code', code)
        .single()

      if (!referrer) return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
      if (referrer.id === user.id) return NextResponse.json({ error: 'No podés usar tu propio código' }, { status: 400 })

      // Verificar que no tenga ya un referido
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('referred_by')
        .eq('id', user.id)
        .single()

      if (currentProfile?.referred_by) return NextResponse.json({ error: 'Ya tenés un código aplicado' }, { status: 400 })

      // Aplicar referido
      await supabase.from('profiles').update({ referred_by: referrer.id }).eq('id', user.id)

      // Actualizar contador del referidor
      const newCount = (referrer.referrals_count || 0) + 1
      const updates: Record<string, unknown> = { referrals_count: newCount }

      // Si tiene 6+ referidos, darle 20 puntos bonus
      if (newCount === 6) {
        const { data: refProfile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', referrer.id)
          .single()
        updates.credits = (refProfile?.credits || 0) + 20

        // Registrar la transacción
        await supabase.from('credit_transactions').insert({
          user_id: referrer.id,
          amount: 20,
          type: 'referral_bonus',
          description: '🌟 Bonus por 6 referidos',
          balance_after: (refProfile?.credits || 0) + 20,
        })
      }

      await supabase.from('profiles').update(updates).eq('id', referrer.id)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
