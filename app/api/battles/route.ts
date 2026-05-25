// app/api/battles/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyNewBattle } from '@/lib/push'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, userId, battleId, matchId, prediction, amount, title, description, battleType } = body

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zjlaabrqfjtvbtbvoaic.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    if (action === 'create') {
      const { data: battle, error } = await supabase
        .from('battles')
        .insert({
          title,
          description,
          created_by: userId,
          match_id: matchId,
          bet_amount: amount,
          pot_total: amount,
          current_participants: 1,
          status: 'open',
          battle_type: battleType || 'match_result',
        })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      await supabase.from('battle_participants').insert({
        battle_id: battle.id,
        user_id: userId,
        prediction,
        amount_placed: amount,
      })

      // 🔔 Notificar a todos que hay una nueva batalla
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single()

      const creatorName = profile?.username || 'Alguien'
      notifyNewBattle(creatorName, title, amount, battle.id) // fire & forget

      return NextResponse.json({ success: true, battle })
    }

    if (action === 'join') {
      const { data: battle } = await supabase
        .from('battles')
        .select('*')
        .eq('id', battleId)
        .single()

      if (!battle) return NextResponse.json({ error: 'Batalla no encontrada' }, { status: 404 })
      if (battle.status !== 'open') return NextResponse.json({ error: 'La batalla ya no está abierta' }, { status: 400 })
      if (battle.created_by === userId) return NextResponse.json({ error: 'No podés unirte a tu propia batalla' }, { status: 400 })

      const { data: existing } = await supabase
        .from('battle_participants')
        .select('id')
        .eq('battle_id', battleId)
        .eq('user_id', userId)
        .single()

      if (existing) return NextResponse.json({ error: 'Ya estás en esta batalla' }, { status: 400 })

      await supabase.from('battle_participants').insert({
        battle_id: battleId,
        user_id: userId,
        prediction,
        amount_placed: amount,
      })

      await supabase.from('battles').update({
        pot_total: battle.pot_total + amount,
        current_participants: battle.current_participants + 1,
        status: 'active',
      }).eq('id', battleId)

      // 🔔 Notificar al creador de la batalla que alguien se unió
      const { data: joinerProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single()

      const joinerName = joinerProfile?.username || 'Alguien'

      import('@/lib/push').then(({ sendPush }) => {
        sendPush({
          type: 'battle',
          title: '¡Aceptaron tu batalla! ⚔️',
          body: `${joinerName} se unió a "${battle.title}" — pozo $${battle.pot_total + amount}`,
          url: '/battles',
          userIds: [battle.created_by],
        })
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
// rebuilt
