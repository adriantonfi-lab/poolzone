'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Copy, Loader2 } from 'lucide-react'
import Link from 'next/link'

const PAYMENT_METHODS = [
  { id: 'zelle', flag: '🇺🇸', name: 'Zelle', detail: 'poolzone@gmail.com', note: 'USA only — instant' },
  { id: 'nequi', flag: '🇨🇴', name: 'Nequi', detail: '+1 (832) 000-0000', note: 'Colombia' },
  { id: 'paypal', flag: '🌎', name: 'PayPal', detail: 'paypal.me/poolzone', note: 'International' },
]

function TransferContent() {
  const params = useSearchParams()
  const userId = params.get('userId')
  const [copied, setCopied] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  async function handleConfirm() {
    setLoading(true)
    await fetch('/api/payments/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount: 30, paymentMethod: 'transfer', notes: 'Manual transfer - pending approval' }),
    })
    setSent(true)
    setLoading(false)
  }

  if (sent) return (
    <div className="min-h-screen bg-[#080812] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <CheckCircle size={64} className="text-[#00C896] mx-auto mb-6" />
        <h1 className="text-2xl font-black text-white mb-3">Payment Sent!</h1>
        <p className="text-gray-400 mb-6">We'll verify your payment and activate your account within 24 hours. You'll receive a notification when it's approved.</p>
        <Link href="/dashboard" className="block bg-[#00C896] text-black font-bold py-4 rounded-xl text-lg">Go to Dashboard →</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#080812] p-4 pb-24">
      <div className="max-w-md mx-auto pt-8">
        <img src="/poolzone-logo.png" alt="PoolZone" className="h-10 mb-8 object-contain" />
        <h1 className="text-2xl font-black text-white mb-2">Pay $30 via Transfer</h1>
        <p className="text-gray-400 mb-8">Send $30 to any of these accounts and confirm below.</p>

        <div className="space-y-3 mb-8">
          {PAYMENT_METHODS.map(m => (
            <div key={m.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{m.flag}</span>
                  <span className="font-bold text-white">{m.name}</span>
                  <span className="text-xs text-gray-500">{m.note}</span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-black/30 rounded-xl px-3 py-2">
                <span className="text-[#00C896] font-mono text-sm">{m.detail}</span>
                <button onClick={() => copy(m.detail, m.id)} className="text-gray-400 hover:text-white transition-colors">
                  {copied === m.id ? <CheckCircle size={16} className="text-[#00C896]" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#00C896]/10 border border-[#00C896]/20 rounded-2xl p-4 mb-6">
          <p className="text-sm text-[#00C896] font-semibold">💡 Include your username in the payment note so we can identify you faster.</p>
        </div>

        <button onClick={handleConfirm} disabled={loading}
          className="w-full bg-[#00C896] text-black font-black py-4 rounded-2xl text-lg disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={20} className="animate-spin" />Processing...</> : "✅ I've sent the payment"}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">Your account will be activated within 24 houmkdir -p ~/Desktop/poolzone/app/\(app\)/join/transfer && cat > ~/Desktop/poolzone/app/\(app\)/join/transfer/page.tsx << 'ENDOFFILE'
'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Copy, Loader2 } from 'lucide-react'
import Link from 'next/link'

const PAYMENT_METHODS = [
  { id: 'zelle', flag: '🇺🇸', name: 'Zelle', detail: 'poolzone@gmail.com', note: 'USA only — instant' },
  { id: 'nequi', flag: '🇨🇴', name: 'Nequi', detail: '+1 (832) 000-0000', note: 'Colombia' },
  { id: 'paypal', flag: '🌎', name: 'PayPal', detail: 'paypal.me/poolzone', note: 'International' },
]

function TransferContent() {
  const params = useSearchParams()
  const userId = params.get('userId')
  const [copied, setCopied] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  async function handleConfirm() {
    setLoading(true)
    await fetch('/api/payments/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount: 30, paymentMethod: 'transfer', notes: 'Manual transfer - pending approval' }),
    })
    setSent(true)
    setLoading(false)
  }

  if (sent) return (
    <div className="min-h-screen bg-[#080812] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <CheckCircle size={64} className="text-[#00C896] mx-auto mb-6" />
        <h1 className="text-2xl font-black text-white mb-3">Payment Sent!</h1>
        <p className="text-gray-400 mb-6">We'll verify your payment and activate your account within 24 hours. You'll receive a notification when it's approved.</p>
        <Link href="/dashboard" className="block bg-[#00C896] text-black font-bold py-4 rounded-xl text-lg">Go to Dashboard →</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#080812] p-4 pb-24">
      <div className="max-w-md mx-auto pt-8">
        <img src="/poolzone-logo.png" alt="PoolZone" className="h-10 mb-8 object-contain" />
        <h1 className="text-2xl font-black text-white mb-2">Pay $30 via Transfer</h1>
        <p className="text-gray-400 mb-8">Send $30 to any of these accounts and confirm below.</p>

        <div className="space-y-3 mb-8">
          {PAYMENT_METHODS.map(m => (
            <div key={m.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{m.flag}</span>
                  <span className="font-bold text-white">{m.name}</span>
                  <span className="text-xs text-gray-500">{m.note}</span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-black/30 rounded-xl px-3 py-2">
                <span className="text-[#00C896] font-mono text-sm">{m.detail}</span>
                <button onClick={() => copy(m.detail, m.id)} className="text-gray-400 hover:text-white transition-colors">
                  {copied === m.id ? <CheckCircle size={16} className="text-[#00C896]" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#00C896]/10 border border-[#00C896]/20 rounded-2xl p-4 mb-6">
          <p className="text-sm text-[#00C896] font-semibold">💡 Include your username in the payment note so we can identify you faster.</p>
        </div>

        <button onClick={handleConfirm} disabled={loading}
          className="w-full bg-[#00C896] text-black font-black py-4 rounded-2xl text-lg disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={20} className="animate-spin" />Processing...</> : "✅ I've sent the payment"}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">Your account will be activated within 24 hours after payment verification.</p>
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
