// app/(app)/admin/PaymentsTab.tsx
'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, DollarSign, Loader2, ExternalLink } from 'lucide-react'

type Payment = {
  id: string
  user_id: string
  amount: number
  payment_method: string
  status: string
  notes: string | null
  proof_url: string | null
  created_at: string
  profiles: { username: string; avatar_url: string | null }
}

export default function PaymentsTab({ adminUserId }: { adminUserId: string }) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState('')
  const [msg, setMsg] = useState('')
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [creditAmount, setCreditAmount] = useState<Record<string, string>>({})

  async function loadPayments() {
    setLoading(true)
    const res = await fetch('/api/admin/payments')
    const data = await res.json()
    setPayments(data.payments || [])
    setLoading(false)
  }

  useEffect(() => { loadPayments() }, [])

  async function handleApprove(payment: Payment) {
    const credits = parseInt(creditAmount[payment.id] || String(payment.amount * 10))
    if (!credits || credits <= 0) return
    setProcessingId(payment.id)
    setMsg('')
    const res = await fetch('/api/admin/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'approve',
        paymentId: payment.id,
        userId: payment.user_id,
        adminId: adminUserId,
        credits,
      }),
    })
    const data = await res.json()
    if (data.success) {
      setMsg(`✅ Pago aprobado — ${credits} créditos acreditados a @${payment.profiles?.username}`)
      loadPayments()
    } else {
      setMsg(`❌ ${data.error}`)
    }
    setProcessingId('')
  }

  async function handleReject(payment: Payment) {
    setProcessingId(payment.id)
    setMsg('')
    const res = await fetch('/api/admin/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reject',
        paymentId: payment.id,
        userId: payment.user_id,
        adminId: adminUserId,
      }),
    })
    const data = await res.json()
    setMsg(data.success ? `✅ Pago rechazado` : `❌ ${data.error}`)
    setProcessingId('')
    loadPayments()
  }

  const filtered = payments.filter(p => filter === 'all' ? true : p.status === filter)
  const pendingCount = payments.filter(p => p.status === 'pending').length

  const btnBase = 'px-3 py-1.5 rounded-xl text-sm font-bold transition-all'
  const btnActive = 'bg-[#00C896] text-black'
  const btnInactive = 'bg-[#0D0D1A] text-white border border-white/10 hover:border-[#00C896]'

  return (
    <div>
      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold ${msg.startsWith('✅') ? 'bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
          {msg}
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        <button className={`${btnBase} ${filter === 'pending' ? btnActive : btnInactive}`} onClick={() => setFilter('pending')}>
          ⏳ Pendientes {pendingCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
        </button>
        <button className={`${btnBase} ${filter === 'approved' ? btnActive : btnInactive}`} onClick={() => setFilter('approved')}>
          ✅ Aprobados
        </button>
        <button className={`${btnBase} ${filter === 'rejected' ? btnActive : btnInactive}`} onClick={() => setFilter('rejected')}>
          ❌ Rechazados
        </button>
        <button className={`${btnBase} ${filter === 'all' ? btnActive : btnInactive}`} onClick={() => setFilter('all')}>
          Todos ({payments.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-white">
          <Loader2 size={20} className="animate-spin" />Loading pagos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign size={32} className="text-gray-600 mx-auto mb-2" />
          <p className="text-white text-base">No hay pagos {filter === 'all' ? '' : filter === 'pending' ? 'pendientes' : filter === 'approved' ? 'aprobados' : 'rechazados'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(payment => (
            <div key={payment.id} className={`bg-[#0D0D1A] border rounded-2xl p-4 ${
              payment.status === 'pending' ? 'border-[#00C896]/30' :
              payment.status === 'approved' ? 'border-[#22C55E]/30' :
              'border-red-500/30'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00C896]/20 flex items-center justify-center">
                    <span className="font-sans text-lg text-[#00C896]">{payment.profiles?.username?.[0]?.toUpperCase() || '?'}</span>
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">@{payment.profiles?.username}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(payment.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-sans text-2xl text-[#00C896]">${payment.amount}</p>
                  <p className="text-xs text-gray-400 capitalize">{payment.payment_method}</p>
                </div>
              </div>

              {payment.notes && (
                <div className="bg-[#080812] rounded-xl px-3 py-2 mb-3">
                  <p className="text-xs text-gray-400 mb-1">Notas:</p>
                  <p className="text-sm text-white">{payment.notes}</p>
                </div>
              )}

              {payment.proof_url && (
                <a href={payment.proof_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-bold text-[#74C0FC] hover:underline mb-3">
                  <ExternalLink size={14} />Ver comprobante
                </a>
              )}

              {payment.status === 'pending' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">Créditos a acreditar (${payment.amount} = {payment.amount * 10} CR por defecto)</p>
                      <input
                        type="number"
                        value={creditAmount[payment.id] ?? String(payment.amount * 10)}
                        onChange={e => setCreditAmount(prev => ({ ...prev, [payment.id]: e.target.value }))}
                        className="w-full bg-[#080812] border border-white/10 rounded-xl px-3 py-2 text-base text-white focus:outline-none focus:border-[#00C896]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(payment)}
                      disabled={processingId === payment.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] font-bold py-2.5 rounded-xl text-sm hover:bg-[#22C55E]/20 transition-all disabled:opacity-40"
                    >
                      {processingId === payment.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleReject(payment)}
                      disabled={processingId === payment.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 font-bold py-2.5 rounded-xl text-sm hover:bg-red-500/20 transition-all disabled:opacity-40"
                    >
                      <XCircle size={16} />Rechazar
                    </button>
                  </div>
                </div>
              )}

              {payment.status !== 'pending' && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold ${
                  payment.status === 'approved' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-red-500/10 text-red-400'
                }`}>
                  {payment.status === 'approved' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  {payment.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
