'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Trophy, Zap, Sparkles, Gift, RefreshCw, Loader2 } from 'lucide-react'

type Transaction = {
  id: string
  amount: number
  type: string
  description: string
  balance_after: number
  created_at: string
}

function getIcon(type: string) {
  if (type.includes('battle') || type.includes('batalla')) return <Zap size={16} className="text-orange-400" />
  if (type.includes('oracle') || type.includes('oraculo')) return <Sparkles size={16} className="text-[#A855F7]" />
  if (type.includes('inscription') || type.includes('inscripcion')) return <DollarSign size={16} className="text-blue-400" />
  if (type.includes('referral') || type.includes('referido')) return <Gift size={16} className="text-[#22C55E]" />
  if (type.includes('prize') || type.includes('premio')) return <Trophy size={16} className="text-[#FFD700]" />
  if (type.includes('reenganche')) return <RefreshCw size={16} className="text-[#A855F7]" />
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

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'America/New_York'
    })
  }

  function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'battle_win': '🏆 Victoria en batalla',
      'battle_loss': '⚔️ Derrota en batalla',
      'battle_refund': '↩️ Devolución batalla',
      'oracle_fee': '🔮 Consulta al Oráculo',
      'inscription': '🎫 Inscripción',
      'referral_bonus': '🌟 Bonus referidos',
      'late_fee': '⏰ Fee tardío',
      'prize': '🥇 Premio del torneo',
      'admin_credit': '⭐ Crédito admin',
      'admin_debit': '📉 Débito admin',
      'reenganche': '🔄 Re-enganche',
    }
    return labels[type] || type
  }

  async function handleReenganche() {
    if (!profile?.id) return
    setReengancheLoading(true)
    setReengancheMsg('')
    try {
      const res = await fetch('/api/reenganche', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id }),
      })
      const data = await res.json()
      if (data.error) {
        setReengancheMsg(data.error)
      } else {
        setReengancheUsed(true)
        setCredits(c => c - 250)
        setReengancheMsg('¡Re-enganche activado! +50 puntos sumados al ranking 🎉')
      }
    } catch {
      setReengancheMsg('Error de conexión')
    }
    setReengancheLoading(false)
  }

  const totalIn = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const totalOut = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto pb-24 md:pb-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-base font-bold text-white hover:text-[#FFD700] transition-colors mb-4">
        <ArrowLeft size={20} />Volver
      </Link>

      <h1 className="font-bebas text-5xl text-white tracking-wider mb-1">WALLET</h1>
      <p className="text-sm font-semibold text-[#86EFAC] mb-6">@{profile?.username} · Tus créditos y movimientos</p>

      {/* Saldo principal */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#0D0D1A] border border-[#FFD700]/30 rounded-2xl p-6 mb-6">
        <p className="text-sm font-bold text-white uppercase tracking-wider mb-1">Saldo disponible</p>
        <p className="font-bebas text-7xl text-[#FFD700] leading-none">{credits}</p>
        <p className="text-base font-bold text-white mt-1">créditos · ${(credits / 10).toFixed(2)}</p>
        <div className="grid grid-cols-3 gap-3 mt-5 border-t border-[#2A2A4A] pt-5">
          <div className="text-center">
            <p className="font-bebas text-3xl text-[#22C55E]">+{totalIn.toFixed(0)}</p>
            <p className="text-xs font-bold text-white">Ingresos</p>
          </div>
          <div className="text-center">
            <p className="font-bebas text-3xl text-red-400">-{totalOut.toFixed(0)}</p>
            <p className="text-xs font-bold text-white">Gastos</p>
          </div>
          <div className="text-center">
            <p className="font-bebas text-3xl text-[#A855F7]">{battlesCount}</p>
            <p className="text-xs font-bold text-white">Batallas</p>
          </div>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-[#A855F7]" />
            <p className="text-xs font-bold text-white">Oráculo gastado</p>
          </div>
          <p className="font-bebas text-3xl text-[#A855F7]">${oracleSpent.toFixed(0)}</p>
        </div>
        <div className="bg-[#1A1A2E] border border-[#FFD700]/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} className="text-[#FFD700]" />
            <p className="text-xs font-bold text-white">Premio estimado 1°</p>
          </div>
          <p className="font-bebas text-3xl text-[#FFD700]">${Math.round(estimatedPot * 0.6)}</p>
          <p className="text-xs text-gray-400">60% del pozo</p>
        </div>
      </div>

      {/* Estado inscripción */}
      <div className={`rounded-2xl p-4 mb-6 border ${
        profile?.inscription_status === 'paid' || profile?.inscription_status === 'approved'
          ? 'bg-[#22C55E]/10 border-[#22C55E]/30'
          : 'bg-[#FFD700]/10 border-[#FFD700]/30'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-white">
              {profile?.inscription_status === 'paid' || profile?.inscription_status === 'approved'
                ? '✅ Inscripción paga'
                : '⏳ Inscripción pendiente'}
            </p>
            <p className="text-xs text-gray-400">Fee: ${profile?.inscription_fee || 25}</p>
          </div>
          {profile?.inscription_status !== 'paid' && profile?.inscription_status !== 'approved' && (
            <Link href="/inscription" className="bg-[#FFD700] text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#FFA500] transition-all">
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
            <p className="font-bebas text-xl text-white tracking-wider">RE-ENGANCHE</p>
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
                <p className="font-bebas text-2xl text-[#FFD700]">$25</p>
                <p className="text-xs font-bold text-white">Costo</p>
              </div>
              <div className="bg-black/30 rounded-xl p-3 text-center">
                <p className="font-bebas text-2xl text-[#A855F7]">+50</p>
                <p className="text-xs font-bold text-white">Puntos al ranking</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              ¿Quedaste lejos en el ranking? Pagá $25 y sumá 50 puntos para meterte en la pelea durante la fase eliminatoria. También válido para nuevos participantes.
            </p>
            {reengancheMsg && (
              <div className={`rounded-xl p-3 mb-3 text-sm font-semibold text-center ${
                reengancheMsg.includes('✅') || reengancheMsg.includes('activado')
                  ? 'bg-[#22C55E]/10 text-[#22C55E]'
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {reengancheMsg}
              </div>
            )}
            <button
              onClick={handleReenganche}
              disabled={reengancheLoading || credits < 250}
              className="w-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-bold py-3 rounded-xl text-base disabled:opacity-40 transition-all hover:opacity-90 flex items-center justify-center gap-2"
            >
              {reengancheLoading
                ? <><Loader2 size={18} className="animate-spin" />Procesando...</>
                : credits < 250
                ? `Necesitás $25 — Tenés $${(credits/10).toFixed(2)}`
                : '🔄 Activar Re-enganche por $25'}
            </button>
          </>
        )}
      </div>

      {/* Historial */}
      <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2A2A4A]">
          <p className="font-bebas text-xl text-white tracking-wider">Historial</p>
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
                  <p className={`font-bebas text-xl ${tx.amount > 0 ? 'text-[#22C55E]' : 'text-red-400'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} CR
                  </p>
                  <p className="text-xs text-gray-500">Saldo: {tx.balance_after}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
