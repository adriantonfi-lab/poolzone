'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function SuccessContent() {
  const params = useSearchParams()
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading')

  useEffect(() => {
    const sessionId = params.get('session_id')
    const userId = params.get('userId')
    if (!sessionId || !userId) { setStatus('error'); return }

    fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, userId }),
    }).then(r => r.json()).then(async d => {
      if (d.success) {
        setStatus('success')
        // Esperar 2 segundos y redirigir al dashboard
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      } else {
        setStatus('error')
      }
    }).catch(() => setStatus('error'))
  }, [])

  if (status === 'loading') return (
    <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={40} className="text-[#00C896] animate-spin mx-auto mb-4" />
        <p className="text-white font-bold">Confirmando tu pago...</p>
      </div>
    </div>
  )

  if (status === 'error') return (
    <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <p className="text-red-400 font-bold text-xl mb-4">Problema confirmando el pago</p>
        <p className="text-gray-400 mb-6">Si el pago se realizó, contactanos y lo resolvemos.</p>
        <a href="/login" className="bg-[#00C896] text-black font-bold px-6 py-3 rounded-xl">Ir al Login</a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <CheckCircle size={64} className="text-[#00C896] mx-auto mb-6" />
        <h1 className="text-3xl font-black text-white mb-2">¡Estás adentro! 🎉</h1>
        <p className="text-gray-400 mb-4">Tu inscripción al Mundial 2026 está confirmada.</p>
        <div className="bg-[#00C896]/10 border border-[#00C896]/20 rounded-xl p-4 mb-4">
          <p className="text-[#00C896] font-bold text-lg">+50 créditos acreditados</p>
          <p className="text-gray-400 text-sm mt-1">$5 para usar en Oracle, modificaciones y challenges</p>
        </div>
        <p className="text-gray-400 text-sm">Redirigiendo al dashboard...</p>
        <Loader2 size={20} className="text-[#00C896] animate-spin mx-auto mt-3" />
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center"><Loader2 size={40} className="text-[#00C896] animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  )
}
