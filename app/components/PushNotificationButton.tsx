// app/components/PushNotificationButton.tsx
'use client'

import { Bell, BellOff, Loader2 } from 'lucide-react'
import { usePushNotifications } from '@/app/hooks/usePushNotifications'

interface Props {
  variant?: 'icon' | 'full'
  className?: string
}

export function PushNotificationButton({ variant = 'full', className = '' }: Props) {
  const { permission, isSubscribed, isLoading, supported, subscribe, unsubscribe } = usePushNotifications()

  if (!supported) return null

  async function handleToggle() {
    if (isSubscribed) {
      await unsubscribe()
    } else {
      const ok = await subscribe()
      if (ok) {
        // Pequeña notificación de bienvenida
        new Notification('¡Che-Bacano activado! 🏆', {
          body: 'Te vamos a avisar de goles, batallas y todo lo importante',
          icon: '/icon-192.png',
        })
      }
    }
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading || permission === 'denied'}
        title={isSubscribed ? 'Desactivar notificaciones' : 'Activar notificaciones'}
        className={`relative p-2 rounded-xl transition-all ${
          isSubscribed
            ? 'text-[#FFD700] bg-[#FFD700]/10 hover:bg-[#FFD700]/20'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        } ${className}`}
      >
        {isLoading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : isSubscribed ? (
          <Bell size={20} />
        ) : (
          <BellOff size={20} />
        )}
        {isSubscribed && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#22C55E] rounded-full" />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || permission === 'denied'}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
        permission === 'denied'
          ? 'bg-red-500/10 border border-red-500/20 text-red-400 cursor-not-allowed'
          : isSubscribed
          ? 'bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E]/20'
          : 'bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/20'
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : isSubscribed ? (
        <Bell size={16} />
      ) : (
        <BellOff size={16} />
      )}
      {permission === 'denied'
        ? 'Notificaciones bloqueadas'
        : isSubscribed
        ? 'Notificaciones ON'
        : 'Activar notificaciones'}
    </button>
  )
}
