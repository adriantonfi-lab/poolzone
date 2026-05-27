'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

function SuccessContent() {
  const params = useSearchParams()
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading')
  const [credits, setCredits] = useState(0)

  useEffect(() => {
    const sessionId = params.get('session_id')
    const userId = params.get('userId')
    if (!sessionId || !userId) { setStatus('error'); return }
    fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, userId }),
    }).then(r => r.json()).then(d => {
      if (d.success) { setCredits(d.credits || 50); setStatus('success') }
      else setStatus('error')
    }).catch(() => setStatus('error'))
  }, [])

  if (status === 'loading') return (
    <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center">
      <Loader2 size={40} className="text-[#00C896] animate-spin" />
    </div>
  )

  if (status === 'error') return (
    <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <p className="text-red-400 font-bold text-xl mb-4">Problema confirmando el pago</p>
        <p className="text-gray-400 mb-6">Si el pago se realizó, contactanos y lo resolvemos.</p>
        <Link href="/dashboard" className="bg-[#00C896] text-black font-bold px-6 py-3 rounded-xl">Ir al Dashboard</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <CheckCircle size={64} className="text-[#00C896] mx-auto mb-6" />
        <h1 className="text-3xl font-black text-white mb-2">¡Estás adentro! 🎉</h1>
        <p className="text-gray-400 mb-6">Tu inscripción al Mundial 2026 está confirmada.</p>
        <div className="bg-[#00C896]/10 border border-[#00C896]/20 rounded-xl p-4 mb-6">
          <p className="text-[#00C896] font-bold text-lg">+{credits} créditos acreditados</p>
          <p className="text-gray-400 text-sm mt-1">Para usar en el Oráculo, modificaciones y batallas</p>
        </div>
        <Link href="/dashboard" className="block bg-[#00C896] text-black font-bold py-4 rounded-xl text-lg">
          Ir a jugar →
        </Link>
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
