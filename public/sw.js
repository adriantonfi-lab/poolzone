// public/sw.js
// Service Worker para Che-Bacano Push Notifications

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let data = {}
  try {
    data = event.data.json()
  } catch {
    data = { title: 'Che-Bacano', body: event.data.text() }
  }

  const {
    title = 'Che-Bacano 🏆',
    body = 'Tenés una notificación nueva',
    icon = '/icon-192.png',
    badge = '/icon-192.png',
    url = '/dashboard',
    tag = 'che-bacano',
    type = 'general',
  } = data

  // Emojis por tipo de notificación
  const icons = {
    goal: '⚽',
    battle: '⚔️',
    chat: '💬',
    new_user: '👤',
    credits: '💰',
    result: '🏆',
    ranking: '📊',
    general: '🔔',
  }

  const emoji = icons[type] || icons.general

  event.waitUntil(
    self.registration.showNotification(`${emoji} ${title}`, {
      body,
      icon,
      badge,
      tag,
      data: { url },
      vibrate: [200, 100, 200],
      requireInteraction: type === 'goal' || type === 'battle',
      actions: [
        { action: 'open', title: 'Ver' },
        { action: 'close', title: 'Cerrar' },
      ],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') return

  const url = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya tiene la app abierta, navegar ahí
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      // Si no, abrir ventana nueva
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})
