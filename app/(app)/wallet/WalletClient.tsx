'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Trophy, Zap, Sparkles, Gift, RefreshCw, Loader2, Upload, CheckCircle, Camera } from 'lucide-react'

type Transaction = {
  id: string
  amount: number
  type: string
  description: string
  balance_after: number
  created_at: string
}

const PAYMENT_METHODS = [
  { id: 'zelle', label: 'Zelle', flag: '🇺🇸', detail: 'adrian.tonfi@gmail.com' },
  { id: 'nequi', label: 'Nequi', flag: '🇨🇴', detail: '+57 300 000 0000' },
  { id: 'zelle', label: 'Zelle', flag: '🇺🇸', detail: 'Contact us for details' },
  { id: 'paypal', label: 'PayPal', flag: '🌎', detail: 'paypal.me/chebacano' },
]

const AMOUNTS = [25, 50, 100]

function getIcon(type: string) {
  if (type.includes('battle') || type.includes('challenge')) return <Zap size={16} className="text-orange-400" />
  if (type.includes('oracle') || type.includes('oraculo')) return <Sparkles size={16} className="text-[#A855F7]" />
  if (type.includes('inscription') || type.includes('inscripcion')) return <DollarSign size={16} className="text-blue-400" />
  if (type.includes('referral') || type.includes('referido')) return <Gift size={16} className="text-[#22C55E]" />
  if (type.includes('prize') || type.includes('premio')) return <Trophy size={16} className="text-[#00C896]" />
  if (type.includes('re-entry')) return <RefreshCw size={16} className="text-[#A855F7]" />
  if (type.includes('late_fee')) return <TrendingDown size={16} className="text-orange-400" />
  if (type.includes('win') || type.includes('ganancia')) return <TrendingUp size={16} className="text-[#22C55E]" />
  if (type.includes('fee') || type.includes('cargo')) return <TrendingDown size={16} className="text-red-400" />
  return <DollarSign size={16} className="text-gray-400" />
}

export default function WalletClient({ profile, transactions, battlesCount, oracleSpent, estimatedPot }: {
  profile: any
  transactions: Transaction[]
  battlesCount: number
  oracleSpent: number
  estimatedPot: number
}) {
  const [reengancheLoading, setReengancheLoading] = useState(false)
  const [reengancheMsg, setReengancheMsg] = useState('')
  const [reengancheUsed, setReengancheUsed] = useState(profile?.reenganche_used || false)
  const [credits, setCredits] = useState(profile?.credits || 0)

  // Carga de créditos
  const [showDeposit, setShowDeposit] = useState(false)
  const [depositAmount, setDepositAmount] = useState(25)
  const [customAmount, setCustomAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('')
  const [proofImage, setProofImage] = useState<string | null>(null)
  const [proofFileName, setProofFileName] = useState('')
  const [depositNotes, setDepositNotes] = useState('')
  const [depositLoading, setDepositLoading] = useState(false)
  const [depositMsg, setDepositMsg] = useState('')
  const [depositSuccess, setDepositSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'America/New_York'
    })
  }

  function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'battle_win': '🏆 Victoria en challenge',
      'battle_loss': '⚔️ Derrota en challenge',
      'battle_refund': '↩️ Devolución challenge',
      'oracle_fee': '🔮 Consulta al Oracle',
      'inscription': '🎫 Registration',
      'referral_bonus': '🌟 Bonus referidos',
      'late_fee': '⏰ Fee por modificación tardía',
      'prize': '🥇 Premio del torneo',
      'admin_credit': '⭐ Crédito admin',
      'admin_debit': '📉 Débito admin',
      're-entry': '🔄 Re-enganche',
    }
    return labels[type] || type
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setDepositMsg('La imagen no puede superar 5MB')
      return
    }
    setProofFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setProofImage(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleDeposit() {
    const amount = customAmount ? parseFloat(customAmount) : depositAmount
    if (!amount || amount < 5) { setDepositMsg('El mínimo es $5'); return }
    if (!selectedMethod) { setDepositMsg('Elegí un método de pago'); return }
    if (!proofImage) { setDepositMsg('Please upload your payment proof'); return }

    setDepositLoading(true)
    setDepositMsg('')

    try {
      const res = await fetch('/api/payments/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          amount,
          paymentMethod: selectedMethod,
          proofImage,
          notes: depositNotes,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setDepositMsg(data.error)
      } else {
        setDepositSuccess(true)
        setDepositMsg('✅ Proof sent. Admin will review and credit your account shortly.')
      }
    } catch {
      setDepositMsg('Error de conexión')
    }
    setDepositLoading(false)
  }

  async function handleReenganche() {
    if (!profile?.id) return
    setReengancheLoading(true)
    setReengancheMsg('')
    try {
      const res = await fetch('/api/re-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id }),
      })
      const data = await res.json()
      if (data.error) {
        setReengancheMsg(data.error)
      } else {
        setReengancheUsed(true)
        setCredits((c: number) => c - 250)
        setReengancheMsg('Re-entry activated! +50 points added to your ranking 🎉')
      }
    } catch {
      setReengancheMsg('Error de conexión')
    }
    setReengancheLoading(false)
  }

  const totalIn = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const totalOut = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  const selectedMethodData = PAYMENT_METHODS.find(m => m.id === selectedMethod)

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto pb-24 md:pb-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-base font-bold text-white hover:text-[#00C896] transition-colors mb-4">
        <ArrowLeft size={20} />Back
      </Link>

      <h1 className="font-sans text-5xl text-white tracking-wider mb-1">WALLET</h1>
      <p className="text-sm font-semibold text-[#86EFAC] mb-6">@{profile?.username} · Tus créditos y movimientos</p>

      {/* Saldo principal */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#0D0D1A] border border-[#00C896]/30 rounded-2xl p-6 mb-6">
        <p className="text-sm font-bold text-white uppercase tracking-wider mb-1">Available Balance</p>
        <p className="font-sans text-7xl text-[#00C896] leading-none">{credits}</p>
        <p className="text-base font-bold text-white mt-1">créditos · ${(credits / 10).toFixed(2)}</p>
        <div className="grid grid-cols-3 gap-3 mt-5 border-t border-white/10 pt-5">
          <div className="text-center">
            <p className="font-sans text-3xl text-[#22C55E]">+{totalIn.toFixed(0)}</p>
            <p className="text-xs font-bold text-white">Ingresos</p>
          </div>
          <div className="text-center">
            <p className="font-sans text-3xl text-red-400">-{totalOut.toFixed(0)}</p>
            <p className="text-xs font-bold text-white">Gastos</p>
          </div>
          <div className="text-center">
            <p className="font-sans text-3xl text-[#A855F7]">{battlesCount}</p>
            <p className="text-xs font-bold text-white">Challenges</p>
          </div>
        </div>
        <button
          onClick={() => setShowDeposit(true)}
          className="w-full mt-4 bg-gradient-to-r from-[#00C896] to-[#00b085] text-black font-bold py-3 rounded-xl text-base hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <DollarSign size={18} />Cargar Créditos
        </button>
      </div>

      {/* MODAL CARGA DE CRÉDITOS */}
      {showDeposit && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-[#0D0D1A] w-full md:max-w-lg md:rounded-2xl rounded-t-2xl border border-white/10 max-h-[90dvh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 shrink-0">
              <span className="font-sans text-2xl text-[#00C896] tracking-wider">Cargar Créditos</span>
              <button onClick={() => { setShowDeposit(false); setDepositSuccess(false); setDepositMsg(''); setProofImage(null) }}
                className="text-white hover:text-[#00C896] text-xl font-bold">✕</button>
            </div>

            {depositSuccess ? (
              <div className="p-8 text-center">
                <CheckCircle size={48} className="text-[#22C55E] mx-auto mb-4" />
                <p className="font-sans text-2xl text-white mb-2">Proof sent!</p>
                <p className="text-sm text-gray-400">El admin lo revisará y acreditará los créditos en breve. Te llegará una notificación cuando esté listo.</p>
                <button onClick={() => { setShowDeposit(false); setDepositSuccess(false); setProofImage(null) }}
                  className="mt-6 bg-[#00C896] text-black font-bold px-6 py-3 rounded-xl">
                  Cerrar
                </button>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 p-4 space-y-4">
                {/* Monto */}
                <div>
                  <p className="text-sm font-bold text-white mb-2">How much do you want to add?</p>
                  <div className="flex gap-2 mb-2">
                    {AMOUNTS.map(a => (
                      <button key={a} onClick={() => { setDepositAmount(a); setCustomAmount('') }}
                        className={`flex-1 py-2.5 rounded-xl border text-base font-bold transition-all ${
                          depositAmount === a && !customAmount
                            ? 'border-[#00C896] bg-[#00C896]/10 text-[#00C896]'
                            : 'border-white/10 bg-[#080812] text-white hover:border-[#00C896]/40'
                        }`}>
                        ${a}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={e => setCustomAmount(e.target.value)}
                    placeholder="Otro monto"
                    className="w-full bg-[#080812] border border-white/10 rounded-xl px-4 py-2.5 text-base text-white focus:outline-none focus:border-[#00C896]"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    = {((customAmount ? parseFloat(customAmount) : depositAmount) * 10).toFixed(0)} créditos
                  </p>
                </div>

                {/* Método de pago */}
                <div>
                  <p className="text-sm font-bold text-white mb-2">Método de pago</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map(m => (
                      <button key={m.id} onClick={() => setSelectedMethod(m.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                          selectedMethod === m.id
                            ? 'border-[#00C896] bg-[#00C896]/10 text-[#00C896]'
                            : 'border-white/10 bg-[#080812] text-white hover:border-[#00C896]/40'
                        }`}>
                        <span>{m.flag}</span>{m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Datos para pagar */}
                {selectedMethodData && (
                  <div className="bg-[#080812] border border-[#00C896]/20 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Send payment to:</p>
                    <p className="text-base font-bold text-[#00C896]">{selectedMethodData.label}</p>
                    <p className="text-sm text-white font-mono mt-1">{selectedMethodData.detail}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Monto: <span className="text-white font-bold">${customAmount || depositAmount}</span>
                    </p>
                  </div>
                )}

                {/* Subir comprobante */}
                <div>
                  <p className="text-sm font-bold text-white mb-2">Payment proof</p>
                  <input
                    type="file"
                    ref={fileRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {proofImage ? (
                    <div className="relative">
                      <img src={proofImage} alt="Proof" className="w-full rounded-xl object-cover max-h-48" />
                      <button onClick={() => { setProofImage(null); setProofFileName('') }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        ✕
                      </button>
                      <p className="text-xs text-gray-400 mt-1">{proofFileName}</p>
                    </div>
                  ) : (
                    <button onClick={() => fileRef.current?.click()}
                      className="w-full border-2 border-dashed border-white/10 hover:border-[#00C896]/40 rounded-xl p-6 flex flex-col items-center gap-2 transition-all">
                      <Camera size={24} className="text-gray-500" />
                      <p className="text-sm text-gray-400">Tap to upload payment proof</p>
                      <p className="text-xs text-gray-600">JPG, PNG — máx 5MB</p>
                    </button>
                  )}
                </div>

                {/* Notas opcionales */}
                <div>
                  <p className="text-sm font-bold text-white mb-2">Notas (opcional)</p>
                  <input
                    type="text"
                    value={depositNotes}
                    onChange={e => setDepositNotes(e.target.value)}
                    placeholder="e.g. Zelle transfer May 25"
                    className="w-full bg-[#080812] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C896]"
                  />
                </div>

                {depositMsg && !depositSuccess && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm font-semibold">
                    {depositMsg}
                  </div>
                )}
              </div>
            )}

            {!depositSuccess && (
              <div className="p-4 border-t border-white/10 shrink-0">
                <button
                  onClick={handleDeposit}
                  disabled={depositLoading || !proofImage || !selectedMethod}
                  className="w-full bg-gradient-to-r from-[#00C896] to-[#00b085] text-black font-bold py-3 rounded-xl text-base disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  {depositLoading
                    ? <><Loader2 size={18} className="animate-spin" />Enviando...</>
                    : <><Upload size={18} />Send proof</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#0D0D1A] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-[#A855F7]" />
            <p className="text-xs font-bold text-white">Oracle gastado</p>
          </div>
          <p className="font-sans text-3xl text-[#A855F7]">${oracleSpent.toFixed(0)}</p>
        </div>
        <div className="bg-[#0D0D1A] border border-[#00C896]/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} className="text-[#00C896]" />
            <p className="text-xs font-bold text-white">Premio estimado 1°</p>
          </div>
          <p className="font-sans text-3xl text-[#00C896]">${Math.round(estimatedPot * 0.6)}</p>
          <p className="text-xs text-gray-400">60% del pozo</p>
        </div>
      </div>

      {/* Estado inscripción */}
      <div className={`rounded-2xl p-4 mb-6 border ${
        profile?.inscription_status === 'paid' || profile?.inscription_status === 'approved'
          ? 'bg-[#22C55E]/10 border-[#22C55E]/30'
          : 'bg-[#00C896]/10 border-[#00C896]/30'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-white">
              {profile?.inscription_status === 'paid' || profile?.inscription_status === 'approved'
                ? '✅ Registration paga'
                : '⏳ Registration pendiente'}
            </p>
            <p className="text-xs text-gray-400">Fee: ${profile?.inscription_fee || 25}</p>
          </div>
          {profile?.inscription_status !== 'paid' && profile?.inscription_status !== 'approved' && (
            <Link href="/join" className="bg-[#00C896] text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#FFA500] transition-all">
              Pagar
            </Link>
          )}
        </div>
      </div>

      {/* RE-ENGANCHE */}
      <div className={`rounded-2xl p-5 mb-6 border ${
        reengancheUsed
          ? 'bg-[#A855F7]/10 border-[#A855F7]/30'
          : 'bg-gradient-to-br from-[#1A1A2E] to-[#1A0A2E] border-[#A855F7]/40'
      }`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#A855F7]/20 flex items-center justify-center">
            <RefreshCw size={20} className="text-[#A855F7]" />
          </div>
          <div>
            <p className="font-sans text-xl text-white tracking-wider">RE-ENGANCHE</p>
            <p className="text-xs text-[#A855F7] font-semibold">Fase Eliminatoria — Una sola vez</p>
          </div>
        </div>
        {reengancheUsed ? (
          <div className="bg-[#A855F7]/10 rounded-xl p-3 text-center">
            <p className="text-base font-bold text-[#A855F7]">✅ Re-enganche activado</p>
            <p className="text-xs text-gray-400 mt-1">+50 puntos sumados a tu ranking</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black/30 rounded-xl p-3 text-center">
                <p className="font-sans text-2xl text-[#00C896]">$25</p>
                <p className="text-xs font-bold text-white">Costo</p>
              </div>
              <div className="bg-black/30 rounded-xl p-3 text-center">
                <p className="font-sans text-2xl text-[#A855F7]">+50</p>
                <p className="text-xs font-bold text-white">Points al ranking</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Fell behind in the rankings? Pay $25 and add 50 points during the knockout phase.
            </p>
            {reengancheMsg && (
              <div className={`rounded-xl p-3 mb-3 text-sm font-semibold text-center ${
                reengancheMsg.includes('activado') ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-red-500/10 text-red-400'
              }`}>
                {reengancheMsg}
              </div>
            )}
            <button onClick={handleReenganche} disabled={reengancheLoading || credits < 250}
              className="w-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-bold py-3 rounded-xl text-base disabled:opacity-40 transition-all hover:opacity-90 flex items-center justify-center gap-2">
              {reengancheLoading
                ? <><Loader2 size={18} className="animate-spin" />Procesando...</>
                : credits < 250
                ? `Necesitás $25 — Tenés $${(credits/10).toFixed(2)}`
                : '🔄 Activar Re-enganche por $25'}
            </button>
          </>
        )}
      </div>

      {/* History */}
      <div className="bg-[#0D0D1A] border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <p className="font-sans text-xl text-white tracking-wider">History</p>
        </div>
        {transactions.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <DollarSign size={32} className="text-gray-600 mx-auto mb-2" />
            <p className="text-white text-base">Sin movimientos aún</p>
          </div>
        ) : (
          <div className="divide-y divide-[#2A2A4A]">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-[#22C55E]/20' : 'bg-red-500/20'}`}>
                  {getIcon(tx.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{tx.description || getTypeLabel(tx.type)}</p>
                  <p className="text-xs text-gray-400">{formatDate(tx.created_at)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-sans text-xl ${tx.amount > 0 ? 'text-[#22C55E]' : 'text-red-400'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} CR
                  </p>
                  <p className="text-xs text-gray-500">Balance: {tx.balance_after}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
