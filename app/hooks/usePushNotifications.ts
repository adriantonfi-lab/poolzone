// app/hooks/usePushNotifications.ts
'use client'

import { useState, useEffect, useCallback } from 'react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setSupported(true)
      setPermission(Notification.permission)
      checkSubscription()
    }
  }, [])

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch {
      setIsSubscribed(false)
    }
  }

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!supported) return false
    setIsLoading(true)

    try {
      // 1. Registrar Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // 2. Pedir permiso
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') {
        setIsLoading(false)
        return false
      }

      // 3. Suscribirse al push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      // 4. Guardar en Supabase
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      })

      if (!res.ok) throw new Error('Error al guardar suscripción')

      setIsSubscribed(true)
      setIsLoading(false)
      return true
    } catch (err) {
      console.error('Error subscribing to push:', err)
      setIsLoading(false)
      return false
    }
  }, [supported])

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
        await subscription.unsubscribe()
      }

      setIsSubscribed(false)
      setIsLoading(false)
      return true
    } catch (err) {
      console.error('Error unsubscribing:', err)
      setIsLoading(false)
      return false
    }
  }, [])

  return { permission, isSubscribed, isLoading, supported, subscribe, unsubscribe }
}
