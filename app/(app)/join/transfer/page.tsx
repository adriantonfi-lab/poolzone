'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2, MessageCircle } from 'lucide-react'
import Link from 'next/link'

function TransferContent() {
  const params = useSearchParams()
  const userId = params.get('userId')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    await fetch('/api/payments/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount: 30, paymentMethod: 'zelle', notes: 'Zelle transfer - pending contact' }),
    })
    setSent(true)
    setLoading(false)
  }

  if (sent) return (
    <div className="min-h-screen bg-[#080812] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <CheckCircle size={64} className="text-[#00C896] mx-auto mb-6" />
        <h1 className="text-2xl font-black text-white mb-3">Request Received!</h1>
        <p className="text-gray-400 mb-6">We will contact you within a few hours with the Zelle payment details. Check your email and WhatsApp.</p>
        <Link href="/dashboard" className="block bg-[#00C896] text-black font-bold py-4 rounded-xl text-lg">Go to Dashboard</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#080812] p-4 pb-24">
      <div className="max-w-md mx-auto pt-8">
        <img src="/poolzone-logo.png" alt="PoolZone" className="h-10 mb-8 object-contain" />
        <h1 className="text-2xl font-black text-white mb-2">Pay via Zelle</h1>
        <p className="text-gray-400 mb-8">No card? No problem. Pay by Zelle — we will send you the details directly.</p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#00C896]/10 flex items-center justify-center">
              <span className="text-2xl">🇺🇸</span>
            </div>
            <div>
              <p className="font-black text-white text-lg">Zelle</p>
              <p className="text-sm text-gray-400">USA only · Instant</p>
            </div>
          </div>
          <div className="bg-[#00C896]/10 border border-[#00C896]/20 rounded-xl p-4">
            <p className="text-[#00C896] font-semibold text-sm leading-relaxed">
              Click the button below and we will reach out to you with our Zelle details within a few hours. Once you send the $30, your account will be activated immediately.
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#00C896] flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-black font-black text-xs">1</span>
            </div>
            <p className="text-white text-sm">Click the button below to request Zelle payment info</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#00C896] flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-black font-black text-xs">2</span>
            </div>
            <p className="text-white text-sm">We contact you with our Zelle details via email or WhatsApp</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#00C896] flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-black font-black text-xs">3</span>
            </div>
            <p className="text-white text-sm">Send $30 — your account gets activated instantly</p>
          </div>
        </div>

        <button onClick={handleConfirm} disabled={loading} className="w-full bg-[#00C896] text-black font-black py-4 rounded-2xl text-lg disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={20} className="animate-spin" />Processing...</> : <><MessageCircle size={20} />Request Zelle Details</>}
        </button>
        <p className="text-center text-xs text-gray-500 mt-4">We will respond within a few hours. Available 7 days a week.</p>
      </div>
    </div>
  )
}

export default function TransferPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080812] flex items-center justify-center"><Loader2 size={40} className="text-[#00C896] animate-spin" /></div>}>
      <TransferContent />
    </Suspense>
  )
}
