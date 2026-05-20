'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Trophy, DollarSign, MessageCircle, Zap, Sparkles, AlertTriangle, CheckCircle, XCircle, Clock, Plus, Eye } from 'lucide-react'

type Tab = 'overview' | 'usuarios' | 'pagos' | 'chat' | 'desafios' | 'resultados'

export default function SuperAdminClient({
  profiles, matches, predictions, battles, payments, messages, oracleQueries, challenges, emailMap, lastSignInMap
}: {
  profiles: any[]; matches: any[]; predictions: any[]; battles: any[];
  payments: any[]; messages: any[]; oracleQueries: any[]; challenges: any[];
  emailMap: Record<string, string>; lastSignInMap: Record<string, string>
}) {
  const [tab, setTab] = useState<Tab>('overview')
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  // Challenge form
  const [challengeMatch, setChallengeMatch] = useState('')
  const [challengeTitle, setChallengeTitle] = useState('')
  const [challengeDesc, setChallengeDesc] = useState('')
  const [challengePrize, setChallengePrize] = useState('')
  const [challengePoints, setChallengePoints] = useState('')

  // Approve payment form
  const [approvingId, setApprovingId] = useState('')

  // Stats
  const totalUsers = profiles.length
  const paidUsers = profiles.filter(p => p.inscription_status === 'paid').length
  const pendingPayments = payments.filter(p => p.status === 'pending').length
  const totalPot = paidUsers * 25
  const openBattles = battles.filter(b => b.status === 'open').length
  const totalPredictions = predictions.length
  const totalMessages = messages.length
  const oracleRevenue = oracleQueries.reduce((s: number, q: any) => s + (q.cost || 0), 0)

  // Per user stats
  const predByUser: Record<string, number> = {}
  for (const p of predictions) predByUser[p.user_id] = (predByUser[p.user_id] || 0) + 1

  const pointsByUser: Record<string, number> = {}
  for (const p of predictions) pointsByUser[p.user_id] = (pointsByUser[p.user_id] || 0) + (p.points_earned || 0)

  const msgByUser: Record<string, number> = {}
  for (const m of messages) msgByUser[m.sender_id] = (msgByUser[m.sender_id] || 0) + 1

  function getUserStatus(p: any): 'green' | 'yellow' | 'red' {
    const hasPaid = p.inscription_status === 'paid'
    const hasPreds = (predByUser[p.id] || 0) > 0
    if (hasPaid && hasPreds) return 'green'
    if (hasPaid || hasPreds) return 'yellow'
    return 'red'
  }

  function formatDate(d: string) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  async function handleApprovePayment(paymentId: string, userId: string, amount: number) {
    setApprovingId(paymentId)
    setSaving(true)
    const res = await fetch('/api/superadmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve_payment', paymentId, userId, amount }),
    })
    const data = await res.json()
    setMsg(data.success ? '✅ Pago aprobado' : `❌ ${data.error}`)
    setSaving(false)
    setApprovingId('')
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setSaving(true)
    const res = await fetch('/api/superadmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'change_role', userId, role: newRole }),
    })
    const data = await res.json()
    setMsg(data.success ? `✅ Rol actualizado a ${newRole}` : `❌ ${data.error}`)
    setSaving(false)
  }

  async function handleCreateChallenge() {
    if (!challengeTitle || !challengeMatch) { setMsg('❌ Completá el título y el partido'); return }
    setSaving(true)
    const res = await fetch('/api/superadmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_challenge',
        matchId: challengeMatch,
        title: challengeTitle,
        description: challengeDesc,
        prizeAmount: parseFloat(challengePrize || '0'),
        bonusPoints: parseInt(challengePoints || '0'),
      }),
    })
    const data = await res.json()
    setMsg(data.success ? '✅ Desafío creado' : `❌ ${data.error}`)
    setSaving(false)
    if (data.success) { setChallengeTitle(''); setChallengeDesc(''); setChallengePrize(''); setChallengePoints('') }
  }

  const tabs: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'usuarios', label: 'Usuarios', icon: Users, badge: totalUsers },
    { id: 'pagos', label: 'Pagos', icon: DollarSign, badge: pendingPayments },
    { id: 'chat', label: 'Chat', icon: MessageCircle, badge: totalMessages },
    { id: 'desafios', label: 'Desafíos', icon: Trophy },
    { id: 'resultados', label: 'Resultados', icon: Zap },
  ]

  const btnBase = 'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all'
  const btnActive = 'bg-[#FFD700] text-black'
  const btnInactive = 'bg-[#1A1A2E] text-white border border-[#2A2A4A] hover:border-[#FFD700]'

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto pb-24 md:pb-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-base font-bold text-white hover:text-[#FFD700] transition-colors mb-4">
        <ArrowLeft size={20} />Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/20 flex items-center justify-center">
          <span className="text-2xl">👁️</span>
        </div>
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-wider">Big Brother</h1>
          <p className="text-sm font-bold text-[#FFD700]">Panel Super Admin · Che-Bacano Mundial 2026</p>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-base font-semibold ${
          msg.startsWith('✅') ? 'bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]' : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>{msg}</div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`${btnBase} ${tab === t.id ? btnActive : btnInactive}`}>
            <t.icon size={14} />
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-black/20 text-black' : 'bg-[#FFD700] text-black'}`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Participantes', value: totalUsers, sub: `${paidUsers} pagaron`, color: 'text-white', icon: '👥' },
              { label: 'Pozo total', value: `$${totalPot}`, sub: `${paidUsers} × $25`, color: 'text-[#FFD700]', icon: '💰' },
              { label: 'Predicciones', value: totalPredictions, sub: `${totalUsers} usuarios`, color: 'text-[#A855F7]', icon: '🎯' },
              { label: 'Oráculo $', value: `$${oracleRevenue}`, sub: `${oracleQueries.length} consultas`, color: 'text-[#22C55E]', icon: '🔮' },
            ].map(k => (
              <div key={k.label} className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{k.icon}</span>
                  <p className="text-xs font-bold text-gray-400">{k.label}</p>
                </div>
                <p className={`font-bebas text-3xl ${k.color}`}>{k.value}</p>
                <p className="text-xs text-gray-500 mt-1">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Premios estimados */}
          <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 border border-[#FFD700]/30 rounded-2xl p-5">
            <p className="font-bebas text-xl text-[#FFD700] tracking-wider mb-3">DISTRIBUCIÓN DEL POZO — ${totalPot}</p>
            <div className="grid grid-cols-3 gap-3">
              {[{p:'1°',pct:60},{p:'2°',pct:30},{p:'3°',pct:10}].map(({p,pct})=>(
                <div key={p} className="text-center bg-[#0D0D0D] rounded-xl p-3">
                  <p className="font-bebas text-3xl text-[#FFD700]">${Math.round(totalPot*pct/100)}</p>
                  <p className="text-sm font-bold text-white">{p} — {pct}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Alertas */}
          <div className="bg-[#1A1A2E] border border-red-500/30 rounded-2xl p-5">
            <p className="font-bebas text-xl text-red-400 tracking-wider mb-3">⚠️ ALERTAS</p>
            <div className="space-y-2">
              {profiles.filter(p => p.inscription_status !== 'paid').length > 0 && (
                <div className="flex items-center gap-2 text-sm text-red-400 font-bold">
                  <AlertTriangle size={16} />
                  {profiles.filter(p => p.inscription_status !== 'paid').length} usuarios sin pagar inscripción
                </div>
              )}
              {pendingPayments > 0 && (
                <div className="flex items-center gap-2 text-sm text-[#FFD700] font-bold">
                  <Clock size={16} />
                  {pendingPayments} comprobantes pendientes de aprobación
                </div>
              )}
              {matches.filter(m => m.status === 'finished' && m.home_score === null).length > 0 && (
                <div className="flex items-center gap-2 text-sm text-orange-400 font-bold">
                  <AlertTriangle size={16} />
                  {matches.filter(m => m.status === 'finished' && m.home_score === null).length} partidos sin resultado cargado
                </div>
              )}
              {profiles.filter(p => (predByUser[p.id] || 0) === 0).length > 0 && (
                <div className="flex items-center gap-2 text-sm text-blue-400 font-bold">
                  <AlertTriangle size={16} />
                  {profiles.filter(p => (predByUser[p.id] || 0) === 0).length} usuarios sin ninguna predicción
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* USUARIOS */}
      {tab === 'usuarios' && (
        <div className="space-y-2">
          {profiles.map(p => {
            const status = getUserStatus(p)
            const email = emailMap[p.id] || '—'
            const lastSeen = lastSignInMap[p.id] || ''
            const preds = predByUser[p.id] || 0
            const points = pointsByUser[p.id] || 0
            const msgs = msgByUser[p.id] || 0

            return (
              <div key={p.id} className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  {/* Semáforo */}
                  <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                    status === 'green' ? 'bg-[#22C55E]' : status === 'yellow' ? 'bg-[#FFD700]' : 'bg-red-500'
                  }`} />

                  {/* Avatar */}
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.username} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#FFD700]/20 flex items-center justify-center shrink-0">
                      <span className="font-bebas text-lg text-[#FFD700]">{p.username?.[0]?.toUpperCase()}</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-base font-bold text-white">@{p.username}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        p.role === 'super_admin' ? 'bg-[#FFD700]/20 text-[#FFD700]' :
                        p.role === 'admin' ? 'bg-[#A855F7]/20 text-[#A855F7]' :
                        'bg-[#2A2A4A] text-gray-400'
                      }`}>{p.role || 'guest'}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        p.inscription_status === 'paid' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-red-500/20 text-red-400'
                      }`}>{p.inscription_status === 'paid' ? '✅ Pagado' : '❌ Sin pagar'}</span>
                      {p.role !== 'super_admin' && (
                        <select
                          defaultValue={p.role || 'guest'}
                          onChange={e => handleRoleChange(p.id, e.target.value)}
                          className="bg-[#0D0D0D] border border-[#2A2A4A] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#FFD700] cursor-pointer">
                          <option value="guest">Guest</option>
                          <option value="family">Family</option>
                          <option value="admin">Manager</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{email}</p>
                    <p className="text-xs text-gray-400">{p.full_name} · {p.favorite_team} · {p.country_of_residence}</p>
                    <div className="flex gap-4 mt-2 flex-wrap">
                      <span className="text-xs font-bold text-[#A855F7]">🎯 {preds} pred. ({points} pts)</span>
                      <span className="text-xs font-bold text-[#22C55E]">💬 {msgs} msgs</span>
                      <span className="text-xs font-bold text-[#FFD700]">💰 {p.credits || 0} CR</span>
                      <span className="text-xs text-gray-500">Último acceso: {formatDate(lastSeen)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* PAGOS */}
      {tab === 'pagos' && (
        <div className="space-y-3">
          <p className="text-sm font-bold text-white mb-3">
            {pendingPayments > 0 ? `⏳ ${pendingPayments} comprobantes pendientes de revisión` : '✅ No hay comprobantes pendientes'}
          </p>
          {payments.map(p => (
            <div key={p.id} className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {p.profiles?.avatar_url ? (
                    <img src={p.profiles.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#FFD700]/20 flex items-center justify-center">
                      <span className="font-bebas text-lg text-[#FFD700]">{p.profiles?.username?.[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-base font-bold text-white">@{p.profiles?.username}</p>
                    <p className="text-xs text-gray-400">{p.payment_method} · ${p.amount} · {formatDate(p.created_at)}</p>
                    {p.notes && <p className="text-xs text-[#86EFAC] mt-0.5">{p.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    p.status === 'approved' ? 'bg-[#22C55E]/20 text-[#22C55E]' :
                    p.status === 'pending' ? 'bg-[#FFD700]/20 text-[#FFD700]' :
                    'bg-red-500/20 text-red-400'
                  }`}>{p.status === 'approved' ? '✅ Aprobado' : p.status === 'pending' ? '⏳ Pendiente' : '❌ Rechazado'}</span>
                  {p.status === 'pending' && (
                    <button
                      onClick={() => handleApprovePayment(p.id, p.user_id, p.amount)}
                      disabled={saving && approvingId === p.id}
                      className="bg-[#22C55E] text-black font-bold px-3 py-1.5 rounded-xl text-xs disabled:opacity-40 hover:bg-[#16A34A] transition-all">
                      Aprobar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {payments.length === 0 && (
            <p className="text-center text-white py-8">No hay comprobantes de pago todavía.</p>
          )}
        </div>
      )}

      {/* CHAT */}
      {tab === 'chat' && (
        <div>
          <p className="text-sm font-bold text-white mb-3">Últimos {messages.length} mensajes del Chat del Quilombo</p>
          <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl overflow-hidden">
            <div className="divide-y divide-[#2A2A4A] max-h-[600px] overflow-y-auto">
              {messages.map((m: any) => (
                <div key={m.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FFD700]/20 flex items-center justify-center shrink-0">
                    <span className="font-bebas text-sm text-[#FFD700]">{m.profiles?.username?.[0]?.toUpperCase() || '?'}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#22C55E]">@{m.profiles?.username || '?'}</p>
                      <p className="text-xs text-gray-500">{formatDate(m.created_at)}</p>
                    </div>
                    <p className="text-sm text-white">{m.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DESAFÍOS */}
      {tab === 'desafios' && (
        <div className="space-y-4">
          {/* Crear desafío */}
          <div className="bg-[#1A1A2E] border border-[#FFD700]/30 rounded-2xl p-5">
            <p className="font-bebas text-xl text-[#FFD700] tracking-wider mb-4">+ NUEVO DESAFÍO</p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-bold text-white mb-1">Partido</p>
                <select value={challengeMatch} onChange={e => setChallengeMatch(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-2.5 text-base text-white focus:outline-none focus:border-[#FFD700]">
                  <option value="">Seleccioná un partido</option>
                  {matches.filter(m => m.status === 'scheduled').map(m => (
                    <option key={m.id} value={m.id}>{m.home_team} vs {m.away_team}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Título del desafío</p>
                <input value={challengeTitle} onChange={e => setChallengeTitle(e.target.value)}
                  placeholder="Ej: ¡$100 para quien acierte el marcador!"
                  className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-2.5 text-base text-white focus:outline-none focus:border-[#FFD700]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Descripción (opcional)</p>
                <textarea value={challengeDesc} onChange={e => setChallengeDesc(e.target.value)}
                  rows={2} placeholder="Detalles del desafío..."
                  className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-2.5 text-base text-white focus:outline-none focus:border-[#FFD700] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-bold text-white mb-1">Premio en $ (USD)</p>
                  <input type="number" value={challengePrize} onChange={e => setChallengePrize(e.target.value)}
                    placeholder="100"
                    className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-2.5 text-base text-white focus:outline-none focus:border-[#FFD700]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">Puntos bonus</p>
                  <input type="number" value={challengePoints} onChange={e => setChallengePoints(e.target.value)}
                    placeholder="50"
                    className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-2.5 text-base text-white focus:outline-none focus:border-[#FFD700]" />
                </div>
              </div>
              <button onClick={handleCreateChallenge} disabled={saving}
                className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold py-3 rounded-xl text-base disabled:opacity-40">
                {saving ? 'Creando...' : '⚡ Crear Desafío'}
              </button>
            </div>
          </div>

          {/* Lista de desafíos */}
          {challenges.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-white">Desafíos activos</p>
              {challenges.map((c: any) => (
                <div key={c.id} className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-4">
                  <p className="text-base font-bold text-[#FFD700]">{c.title}</p>
                  <p className="text-sm text-white">{c.matches?.home_team} vs {c.matches?.away_team}</p>
                  {c.description && <p className="text-xs text-gray-400 mt-1">{c.description}</p>}
                  <div className="flex gap-3 mt-2">
                    {c.prize_amount > 0 && <span className="text-xs font-bold text-[#22C55E]">💰 ${c.prize_amount}</span>}
                    {c.bonus_points > 0 && <span className="text-xs font-bold text-[#A855F7]">⭐ +{c.bonus_points} pts</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RESULTADOS */}
      {tab === 'resultados' && (
        <div>
          <p className="text-sm font-bold text-white mb-3">Cargá los resultados — el sistema calcula puntos automáticamente.</p>
          <Link href="/admin" className="inline-flex items-center gap-2 bg-[#FFD700] text-black font-bold px-4 py-3 rounded-xl text-base hover:bg-[#FFA500] transition-all">
            <Zap size={18} />
            Ir al Panel de Resultados
          </Link>
        </div>
      )}
    </div>
  )
}
