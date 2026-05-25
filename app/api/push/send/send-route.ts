// app/api/push/send/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:adrian.tonfi@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export type NotificationType =
  | 'goal'
  | 'result'
  | 'battle'
  | 'chat'
  | 'new_user'
  | 'credits'
  | 'ranking'
  | 'general'

export interface PushPayload {
  type: NotificationType
  title: string
  body: string
  url?: string
  tag?: string
  // A quién enviar:
  // - userIds: array de UUIDs específicos
  // - broadcast: true para todos
  userIds?: string[]
  broadcast?: boolean
}

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const payload: PushPayload = await req.json()
    const { type, title, body, url = '/dashboard', tag, userIds, broadcast } = payload

    if (!title || !body) {
      return NextResponse.json({ error: 'title y body son requeridos' }, { status: 400 })
    }

    // Obtener suscripciones
    let query = supabase.from('push_subscriptions').select('*')

    if (!broadcast && userIds && userIds.length > 0) {
      query = query.in('user_id', userIds)
    }

    const { data: subscriptions, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'Sin suscriptores' })
    }

    const notificationPayload = JSON.stringify({ type, title, body, url, tag: tag || type })

    let sent = 0
    let failed = 0
    const expiredEndpoints: string[] = []

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            notificationPayload
          )
          sent++
        } catch (err: any) {
          // 410 = suscripción expirada, limpiar de DB
          if (err.statusCode === 410 || err.statusCode === 404) {
            expiredEndpoints.push(sub.endpoint)
          }
          failed++
        }
      })
    )

    // Limpiar suscripciones expiradas
    if (expiredEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints)
    }

    return NextResponse.json({ success: true, sent, failed, total: subscriptions.length })
  } catch (err) {
    console.error('Push send error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
