'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Copy, Check, Users, DollarSign, Trophy, Gift } from 'lucide-react'
import Link from 'next/link'

type Profile = {
  id: string
  username: string
  avatar_url: string | null
  inscription_status: string
  inscription_fee: number
  referral_code: string | null
  referrals_count: number
  discount_applied: number
  credits: number
  referred_by: string | null
}

type PaymentProof = {
  id: string
  amount: number
  payment_method: string
  status: string
  created_at: string
  notes: string | null
}

const PAYMENT_METHODS = [
  { id: 'zelle', label: 'Zelle', icon: '💳' },
  { id: 'venmo', label: 'Venmo', icon: '💸' },
  { id: 'paypal', label: 'PayPal', icon: '🅿️' },
  { id: 'transferencia', label: 'Transferencia', icon: '🏦' },
  { id: 'efectivo', label: 'Efectivo', icon: '💵' },
]

function calcFee(referralsCount: number, isInvited: boolean): number {
  const base = isInvited ? 50 : 25
  const discount = Math.min(referralsCount * 5, base)
  return Math.max(base - discount, 0)
}

function calcDiscount(referralsCount: number, isInvited: boolean): number {
  const base = isInvited ? 50 : 25
  return Math.min(referralsCount * 5, base)
}

export default function InscriptionPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [payments, setPayments] = useState<PaymentProof[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'estado' | 'pagar' | 'referidos'>('estado')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [notes, setNotes] = useState('')
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const [referralInput, setReferralInput] = useState('')
  const [referredUsers, setReferredUsers] = useState<{ username: string; inscription_status: string }[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(prof)
      setAmount(String(calcFee(prof?.referrals_count || 0, !!prof?.referred_by)))

      // Generar código de referido si no tiene
      if (!prof?.referral_code) {
        const code = (prof?.username || user.id.slice(0, 6)).toUpperCase() + Math.floor(Math.random() * 100)
        await supabase.from('profiles').update({ referral_code: code }).eq('id', user.id)
        prof.referral_code = code
      }

      // Traer comprobantes de pago
      const { data: pays } = await supabase
        .from('payment_proofs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setPayments(pays || [])

      // Traer referidos
      const { data: refs } = await supabase
        .from('profiles')
        .select('username, inscription_status')
        .eq('referred_by', user.id)
      setReferredUsers(refs || [])

      setLoading(false)
    })
  }, [])

  async function handleSubmitPayment() {
    if (!paymentMethod || !amount) return
    setSubmitting(true)
    setMsg('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('payment_proofs').insert({
      user_id: user.id,
      amount: parseFloat(amount),
      payment_method: paymentMethod,
      notes,
      status: 'pending',
    })

    if (error) {
      setMsg('❌ Error al enviar. Intentá de nuevo.')
    } else {
      setMsg('✅ Comprobante enviado. Un admin lo revisará pronto.')
      setTab('estado')
    }
    setSubmitting(false)
  }

  async function handleApplyReferral() {
    if (!referralInput.trim()) return
    setSubmitting(true)
    const res = await fetch('/api/inscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'apply_referral', code: referralInput.trim().toUpperCase() }),
    })
    const data = await res.json()
    setMsg(data.success ? '✅ Código aplicado correctamente' : `❌ ${data.error}`)
    setSubmitting(false)
  }

  function copyCode() {
    if (!profile?.referral_code) return
    navigator.clipboard.writeText(profile.referral_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareWhatsApp() {
    if (!profile?.referral_code) return
    const text = `🏆 ¡Unite a Che-Bacano, la polla familiar del Mundial 2026!\n\nUsá mi código de referido: *${profile.referral_code}*\n\nRegistrate en: https://che-bacano.com/register\n\n¡$5 de descuento por cada amigo que traigas!`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-white font-bebas text-2xl animate-pulse">Cargando...</p>
    </div>
  )

  const fee = calcFee(profile?.referrals_count || 0, !!profile?.referred_by)
  const discount = calcDiscount(profile?.referrals_count || 0, !!profile?.referred_by)
  const basePrice = profile?.referred_by ? 50 : 25
  const isInvited = !!profile?.referred_by
  const isPaid = profile?.inscription_status === 'paid'
  const isPending = profile?.inscription_status === 'pending'
  const isReview = payments.some(p => p.status === 'pending')

  const btnBase = 'px-4 py-2 rounded-xl text-sm font-bold transition-all'
  const btnActive = 'bg-[#FFD700] text-black'
  const btnInactive = 'bg-[#1A1A2E] text-white border border-[#2A2A4A] hover:border-[#FFD700]'

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto pb-24 md:pb-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-base font-bold text-white hover:text-[#FFD700] transition-colors mb-4">
        <ArrowLeft size={20} />Dashboard
      </Link>

      <h1 className="font-bebas text-5xl text-white tracking-wider mb-1">Inscripción</h1>
      <p className="text-sm font-semibold text-[#86EFAC] mb-6">Mundial 2026 · Che-Bacano</p>

      {/* Estado de inscripción */}
      <div className={`rounded-2xl p-5 mb-6 border-2 ${
        isPaid ? 'bg-[#22C55E]/10 border-[#22C55E]/40' :
        isReview ? 'bg-[#FFD700]/10 border-[#FFD700]/40' :
        'bg-[#1A1A2E] border-[#2A2A4A]'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
            isPaid ? 'bg-[#22C55E]/20' : isReview ? 'bg-[#FFD700]/20' : 'bg-[#2A2A4A]'
          }`}>
            {isPaid ? '✅' : isReview ? '⏳' : '⚽'}
          </div>
          <div className="flex-1">
            <p className="font-bebas text-2xl text-white tracking-wider">
              {isPaid ? '¡Inscripto!' : isReview ? 'En revisión' : 'Pendiente de pago'}
            </p>
            <p className="text-sm font-semibold text-white">
              {isPaid ? 'Ya podés participar en la polla' :
               isReview ? 'Un admin está revisando tu comprobante' :
               `Pagá $${fee} para participar`}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bebas text-3xl text-[#FFD700]">${fee}</p>
            {discount > 0 && <p className="text-xs text-[#22C55E] font-bold">-${discount} descuento</p>}
          </div>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-base font-semibold ${
          msg.startsWith('✅') ? 'bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]' : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>{msg}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button className={`${btnBase} ${tab === 'estado' ? btnActive : btnInactive}`} onClick={() => setTab('estado')}>
          Estado
        </button>
        {!isPaid && (
          <button className={`${btnBase} ${tab === 'pagar' ? btnActive : btnInactive}`} onClick={() => setTab('pagar')}>
            💰 Pagar
          </button>
        )}
        <button className={`${btnBase} ${tab === 'referidos' ? btnActive : btnInactive}`} onClick={() => setTab('referidos')}>
          🎁 Referidos
        </button>
      </div>

      {/* TAB: ESTADO */}
      {tab === 'estado' && (
        <div className="space-y-4">
          {/* Desglose de precio */}
          <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-5">
            <p className="font-bebas text-lg text-white tracking-wider mb-4">DESGLOSE DE PAGO</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-base text-white">{isInvited ? 'Invitado' : 'Familiar'}</span>
                <span className="text-base font-bold text-white">${basePrice}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-base text-[#22C55E]">Descuento referidos ({profile?.referrals_count} × $5)</span>
                  <span className="text-base font-bold text-[#22C55E]">-${discount}</span>
                </div>
              )}
              <div className="border-t border-[#2A2A4A] pt-2 flex justify-between">
                <span className="text-base font-bold text-white">Total a pagar</span>
                <span className="font-bebas text-2xl text-[#FFD700]">${fee}</span>
              </div>
              {fee === 0 && (
                <p className="text-sm font-bold text-[#22C55E] text-center">🎉 ¡Tu inscripción es gratis por tus referidos!</p>
              )}
            </div>
          </div>

          {/* Historial de pagos */}
          {payments.length > 0 && (
            <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#2A2A4A]">
                <p className="font-bebas text-lg text-white tracking-wider">COMPROBANTES ENVIADOS</p>
              </div>
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A4A] last:border-0">
                  <div>
                    <p className="text-base font-bold text-white">{p.payment_method} — ${p.amount}</p>
                    <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('es-ES')}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    p.status === 'approved' ? 'bg-[#22C55E]/20 text-[#22C55E]' :
                    p.status === 'pending' ? 'bg-[#FFD700]/20 text-[#FFD700]' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {p.status === 'approved' ? '✅ Aprobado' : p.status === 'pending' ? '⏳ En revisión' : '❌ Rechazado'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Premio */}
          <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 border border-[#FFD700]/30 rounded-2xl p-5">
            <p className="font-bebas text-lg text-[#FFD700] tracking-wider mb-3">PREMIOS DEL TORNEO</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="text-2xl">🥇</p><p className="font-bebas text-xl text-white">60%</p><p className="text-xs text-[#FFD700]">1° lugar</p></div>
              <div><p className="text-2xl">🥈</p><p className="font-bebas text-xl text-white">30%</p><p className="text-xs text-[#FFD700]">2° lugar</p></div>
              <div><p className="text-2xl">🥉</p><p className="font-bebas text-xl text-white">10%</p><p className="text-xs text-[#FFD700]">3° lugar</p></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PAGAR */}
      {tab === 'pagar' && !isPaid && (
        <div className="space-y-4">
          <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-5">
            <p className="font-bebas text-lg text-white tracking-wider mb-4">MÉTODO DE PAGO</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {PAYMENT_METHODS.map(m => (
                <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-sm font-bold transition-all ${
                    paymentMethod === m.id
                      ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                      : 'border-[#2A2A4A] bg-[#0D0D0D] text-white hover:border-[#FFD700]/40'
                  }`}>
                  <span className="text-xl">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <p className="text-sm font-bold text-white mb-2">Monto</p>
              <div className="bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="font-bebas text-3xl text-[#FFD700]">${fee}</span>
                <span className="text-sm text-gray-400">USD</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-bold text-white mb-2">Notas / Referencia (opcional)</p>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Número de confirmación, nombre del titular, etc."
                rows={3}
                className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-3 text-base text-white focus:outline-none focus:border-[#FFD700] resize-none" />
            </div>

            <div className="bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl p-4 mb-4">
              <p className="text-sm font-bold text-white mb-2">📍 Datos de pago</p>
              <p className="text-sm text-[#86EFAC]">Zelle / Venmo: <span className="font-bold text-white">che.bacano2026@gmail.com</span></p>
              <p className="text-sm text-[#86EFAC]">PayPal: <span className="font-bold text-white">@chebacano</span></p>
              <p className="text-xs text-gray-400 mt-2">Enviá el comprobante y un admin lo aprobará en menos de 24hs.</p>
            </div>

            <button onClick={handleSubmitPayment} disabled={!paymentMethod || submitting}
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold py-3 rounded-xl text-base disabled:opacity-40 transition-all">
              {submitting ? 'Enviando...' : '✅ Confirmar pago realizado'}
            </button>
          </div>
        </div>
      )}

      {/* TAB: REFERIDOS */}
      {tab === 'referidos' && (
        <div className="space-y-4">
          {/* Mi código */}
          <div className="bg-[#1A1A2E] border border-[#FFD700]/30 rounded-2xl p-5">
            <p className="font-bebas text-lg text-[#FFD700] tracking-wider mb-3">MI CÓDIGO DE REFERIDO</p>
            <div className="flex items-center gap-3 bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-3 mb-3">
              <span className="font-bebas text-3xl text-[#FFD700] tracking-widest flex-1">{profile?.referral_code || '...'}</span>
              <button onClick={copyCode} className="text-gray-400 hover:text-[#FFD700] transition-colors">
                {copied ? <Check size={20} className="text-[#22C55E]" /> : <Copy size={20} />}
              </button>
            </div>
            <button onClick={shareWhatsApp}
              className="w-full bg-[#25D366] text-white font-bold py-3 rounded-xl text-base hover:bg-[#128C7E] transition-all">
              📲 Compartir por WhatsApp
            </button>
          </div>

          {/* Sistema de descuentos */}
          <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-5">
            <p className="font-bebas text-lg text-white tracking-wider mb-3">SISTEMA DE DESCUENTOS</p>
            <div className="space-y-2">
              {[1,2,3,4,5].map(n => {
                const desc = Math.min(n * 5, 25)
                const active = (profile?.referrals_count || 0) >= n
                return (
                  <div key={n} className={`flex items-center justify-between px-3 py-2 rounded-xl ${active ? 'bg-[#22C55E]/10 border border-[#22C55E]/20' : 'bg-[#0D0D0D] border border-[#2A2A4A]'}`}>
                    <span className={`text-sm font-bold ${active ? 'text-[#22C55E]' : 'text-gray-400'}`}>
                      {active ? '✅' : '○'} {n} referido{n > 1 ? 's' : ''}
                    </span>
                    <span className={`text-sm font-bold ${active ? 'text-[#22C55E]' : 'text-white'}`}>
                      {n >= 5 ? '🎉 ¡Gratis!' : `-$${desc}`}
                    </span>
                  </div>
                )
              })}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#A855F7]/10 border border-[#A855F7]/20">
                <span className="text-sm font-bold text-[#A855F7]">🌟 6+ referidos</span>
                <span className="text-sm font-bold text-[#A855F7]">+20 pts bonus</span>
              </div>
            </div>
          </div>

          {/* Tus referidos */}
          {referredUsers.length > 0 && (
            <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#2A2A4A]">
                <p className="font-bebas text-lg text-white tracking-wider">TUS REFERIDOS ({referredUsers.length})</p>
              </div>
              {referredUsers.map((u, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A4A] last:border-0">
                  <p className="text-base font-bold text-white">@{u.username}</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    u.inscription_status === 'paid' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#FFD700]/20 text-[#FFD700]'
                  }`}>
                    {u.inscription_status === 'paid' ? '✅ Pagado' : '⏳ Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Aplicar código referido */}
          {!profile?.referred_by && (
            <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-5">
              <p className="font-bebas text-lg text-white tracking-wider mb-3">¿TENÉS UN CÓDIGO DE REFERIDO?</p>
              <div className="flex gap-2">
                <input value={referralInput} onChange={e => setReferralInput(e.target.value.toUpperCase())}
                  placeholder="Ej: AFTA42"
                  className="flex-1 bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-2.5 text-base text-white focus:outline-none focus:border-[#FFD700] uppercase" />
                <button onClick={handleApplyReferral} disabled={!referralInput.trim() || submitting}
                  className="bg-[#FFD700] text-black font-bold px-4 py-2.5 rounded-xl text-sm disabled:opacity-40">
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
