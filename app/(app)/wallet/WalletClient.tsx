'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Trophy, Zap, Sparkles, Gift } from 'lucide-react'

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
  const t = useTranslations('wallet')
  const tc = useTranslations('common')

  const locale = typeof document !== 'undefined'
    ? document.cookie.match(/locale=([^;]+)/)?.[1] || 'es'
    : 'es'

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'America/New_York'
    })
  }

  function getTypeLabel(type: string): string {
    const labels: Record<string, Record<string, string>> = {
      es: {
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
      },
      en: {
        'battle_win': '🏆 Battle win',
        'battle_loss': '⚔️ Battle loss',
        'battle_refund': '↩️ Battle refund',
        'oracle_fee': '🔮 Oracle query',
        'inscription': '🎫 Registration',
        'referral_bonus': '🌟 Referral bonus',
        'late_fee': '⏰ Late fee',
        'prize': '🥇 Tournament prize',
        'admin_credit': '⭐ Admin credit',
        'admin_debit': '📉 Admin debit',
      }
    }
    return labels[locale]?.[type] || labels['es'][type] || type
  }

  const totalIn = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const totalOut = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto pb-24 md:pb-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-base font-bold text-white hover:text-[#FFD700] transition-colors mb-4">
        <ArrowLeft size={20} />{tc('back')}
      </Link>

      <h1 className="font-bebas text-5xl text-white tracking-wider mb-1">{t('title')}</h1>
      <p className="text-sm font-semibold text-[#86EFAC] mb-6">@{profile?.username} · {t('subtitle')}</p>

      {/* Saldo principal */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#0D0D1A] border border-[#FFD700]/30 rounded-2xl p-6 mb-6">
        <p className="text-sm font-bold text-white uppercase tracking-wider mb-1">{t('balance')}</p>
        <p className="font-bebas text-7xl text-[#FFD700] leading-none">{profile?.credits || 0}</p>
        <p className="text-base font-bold text-white mt-1">{t('credits')}</p>
        <div className="grid grid-cols-3 gap-3 mt-5 border-t border-[#2A2A4A] pt-5">
          <div className="text-center">
            <p className="font-bebas text-3xl text-[#22C55E]">+{totalIn.toFixed(0)}</p>
            <p className="text-xs font-bold text-white">{t('income')}</p>
          </div>
          <div className="text-center">
            <p className="font-bebas text-3xl text-red-400">-{totalOut.toFixed(0)}</p>
            <p className="text-xs font-bold text-white">{t('expenses')}</p>
          </div>
          <div className="text-center">
            <p className="font-bebas text-3xl text-[#A855F7]">{battlesCount}</p>
            <p className="text-xs font-bold text-white">{t('battles')}</p>
          </div>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-[#A855F7]" />
            <p className="text-xs font-bold text-white">{t('oracleSpent')}</p>
          </div>
          <p className="font-bebas text-3xl text-[#A855F7]">${oracleSpent.toFixed(0)}</p>
        </div>
        <div className="bg-[#1A1A2E] border border-[#FFD700]/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} className="text-[#FFD700]" />
            <p className="text-xs font-bold text-white">{t('potentialPrize')}</p>
          </div>
          <p className="font-bebas text-3xl text-[#FFD700]">${Math.round(estimatedPot * 0.6)}</p>
          <p className="text-xs text-gray-400">{t('ofPot')}</p>
        </div>
      </div>

      {/* Estado inscripción */}
      <div className={`rounded-2xl p-4 mb-6 border ${
        profile?.inscription_status === 'paid'
          ? 'bg-[#22C55E]/10 border-[#22C55E]/30'
          : 'bg-[#FFD700]/10 border-[#FFD700]/30'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-white">
              {profile?.inscription_status === 'paid' ? t('inscriptionPaid') : t('inscriptionPending')}
            </p>
            <p className="text-xs text-gray-400">{t('fee')}: ${profile?.inscription_fee || 25}</p>
          </div>
          {profile?.inscription_status !== 'paid' && (
            <Link href="/inscription" className="bg-[#FFD700] text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#FFA500] transition-all">
              {t('pay')}
            </Link>
          )}
        </div>
      </div>

      {/* Historial */}
      <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2A2A4A]">
          <p className="font-bebas text-xl text-white tracking-wider">{t('history')}</p>
        </div>
        {transactions.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <DollarSign size={32} className="text-gray-600 mx-auto mb-2" />
            <p className="text-white text-base">{t('noMovements')}</p>
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
                  <p className="text-xs text-gray-500">{locale === 'en' ? 'Balance' : 'Saldo'}: {tx.balance_after}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
