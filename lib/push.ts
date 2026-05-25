// app/lib/push.ts
// Helper para enviar notificaciones desde cualquier API route

import type { NotificationType } from '@/app/api/push/send/route'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://che-bacano-final.vercel.app'

interface SendPushOptions {
  type: NotificationType
  title: string
  body: string
  url?: string
  tag?: string
  userIds?: string[]      // Usuarios específicos
  broadcast?: boolean     // Todos los usuarios
}

export async function sendPush(options: SendPushOptions): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/push/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    })
  } catch (err) {
    // Nunca romper el flujo principal por una notificación fallida
    console.error('sendPush error:', err)
  }
}

// ============================================
// Helpers específicos por tipo de evento
// ============================================

export async function notifyGoal(matchTitle: string, score: string, matchId?: string) {
  await sendPush({
    type: 'goal',
    title: '¡GOOOOL! ⚽',
    body: `${matchTitle} — ${score}`,
    url: matchId ? `/fixture?match=${matchId}` : '/fixture',
    tag: 'goal',
    broadcast: true,
  })
}

export async function notifyResult(matchTitle: string, score: string, matchId?: string) {
  await sendPush({
    type: 'result',
    title: 'Resultado final 🏆',
    body: `${matchTitle} terminó ${score}`,
    url: matchId ? `/fixture?match=${matchId}` : '/fixture',
    tag: 'result',
    broadcast: true,
  })
}

export async function notifyNewBattle(creatorName: string, matchTitle: string, amount: number, battleId: string) {
  await sendPush({
    type: 'battle',
    title: '¡Nueva batalla! ⚔️',
    body: `${creatorName} desafía en ${matchTitle} por $${amount}`,
    url: '/battles',
    tag: 'battle',
    broadcast: true,
  })
}

export async function notifyChatMessage(senderName: string, message: string) {
  await sendPush({
    type: 'chat',
    title: `${senderName} en el Quilombo 💬`,
    body: message.length > 80 ? message.substring(0, 80) + '...' : message,
    url: '/locker-room',
    tag: 'chat',
    broadcast: true,
  })
}

export async function notifyNewUser(username: string) {
  await sendPush({
    type: 'new_user',
    title: '¡Nuevo participante! 👤',
    body: `${username} se unió a Che-Bacano`,
    url: '/ranking',
    tag: 'new_user',
    broadcast: true,
  })
}

export async function notifyCreditsApproved(userId: string, amount: number) {
  await sendPush({
    type: 'credits',
    title: '¡Créditos acreditados! 💰',
    body: `Se acreditaron $${amount} en tu wallet`,
    url: '/wallet',
    tag: 'credits',
    userIds: [userId],
  })
}
