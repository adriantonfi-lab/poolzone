'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Trophy, DollarSign, MessageCircle, Zap, Sparkles, AlertTriangle, CheckCircle, Clock, Shield, BarChart3, Settings, Bell, TrendingUp } from 'lucide-react'

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
  const [challengeMatch, setChallengeMatch] = useState('')
  const [challengeTitle, setChallengeTitle] = useState('')
  const [challengeDesc, setChallengeDesc] = useState('')
  const [challengePrize, setChallengePrize] = useState('')
  const [challengePoints, setChallengePoints] = useState('')
  const [approvingId, setApprovingId] = useState('')

  const totalUsers = profiles.length
  const paidUsers = profiles.filter(p => p.inscription_status === 'paid').length
  const pendingPayments = payments.filter(p => p.status === 'pending').length
  const totalPot = paidUsers * 25
  const totalPredictions = predictions.length
  const totalMessages = messages.length
  const oracleRevenue = oracleQueries.reduce((s: number, q: any) => s + (q.cost || 0), 0)

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
    setApprovingId(paymentId); setSaving(true)
    const res = await fetch('/api/superadmin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve_payment', paymentId, userId, amount }) })
    const data = await res.json()
    setMsg(data.success ? '✅ Pago aprobado' : `❌ ${data.error}`)
    setSaving(false); setApprovingId('')
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setSaving(true)
    const res = await fetch('/api/superadmin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'change_role', userId, role: newRole }) })
    const data = await res.json()
    setMsg(data.success ? `✅ Rol actualizado a ${newRole}` : `❌ ${data.error}`)
    setSaving(false)
  }

  async function handleCreateChallenge() {
    if (!challengeTitle || !challengeMatch) { setMsg('❌ Completá el título y el partido'); return }
    setSaving(true)
    const res = await fetch('/api/superadmin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create_challenge', matchId: challengeMatch, title: challengeTitle, description: challengeDesc, prizeAmount: parseFloat(challengePrize || '0'), bonusPoints: parseInt(challengePoints || '0') }) })
    const data = await res.json()
    setMsg(data.success ? '✅ Desafío creado' : `❌ ${data.error}`)
    setSaving(false)
    if (data.success) { setChallengeTitle(''); setChallengeDesc(''); setChallengePrize(''); setChallengePoints('') }
  }

  const tabs: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'usuarios', label: 'Usuarios', icon: Users, badge: totalUsers },
    { id: 'pagos', label: 'Pagos', icon: DollarSign, badge: pendingPayments },
    { id: 'chat', label: 'Chat', icon: MessageCircle, badge: totalMessages },
    { id: 'desafios', label: 'Desafíos', icon: Trophy },
    { id: 'resultados', label: 'Resultados', icon: Zap },
  ]

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto pb-24 md:pb-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors mb-5">
        <ArrowLeft size={16} /> Volver al Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-[#00C896]/10 to-transparent border border-[#00C896]/20 rounded-2xl p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#00C896]/20 border border-[#00C896]/30 flex items-center justify-center shrink-0">
          <Shield size={24} className="text-[#00C896]" />
        </div>
        <div>
          <h1 className="font-sans text-3xl text-white tracking-wider leading-none">SUPER ADMINISTRADOR</h1>
          <p className="text-sm font-semibold text-[#00C896]">Panel de control · PoolZone Mundial 2026</p>
        </div>
        <div className="ml-auto text-right hidden md:block">
          <p className="text-sm font-bold text-orange-400">Usuarios totales</p>
          <p className="font-sans text-3xl text-white">{totalUsers}</p>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold ${msg.startsWith('✅') ? 'bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>{msg}</div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.id ? 'bg-[#00C896] text-black shadow-lg shadow-[#FFD700]/20' : 'bg-[#0D0D1A] text-gray-300 border border-white/10 hover:border-[#00C896]/50 hover:text-white'}`}>
            <t.icon size={15} />
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-black/20 text-black' : 'bg-[#00C896]/20 text-[#00C896]'}`}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Participantes', value: totalUsers, sub: `${paidUsers} pagaron`, color: 'text-white', icon: Users, iconColor: 'text-blue-400', border: 'border-blue-400/20' },
              { label: 'Pozo total', value: `$${totalPot}`, sub: `${paidUsers} × $25`, color: 'text-[#00C896]', icon: DollarSign, iconColor: 'text-[#00C896]', border: 'border-[#00C896]/20' },
              { label: 'Predicciones', value: totalPredictions, sub: `${totalUsers} usuarios`, color: 'text-[#A855F7]', icon: TrendingUp, iconColor: 'text-[#A855F7]', border: 'border-[#A855F7]/20' },
              { label: 'Oráculo', value: `$${oracleRevenue}`, sub: `${oracleQueries.length} consultas`, color: 'text-[#22C55E]', icon: Sparkles, iconColor: 'text-[#22C55E]', border: 'border-[#22C55E]/20' },
            ].map(k => (
              <div key={k.label} className={`bg-[#0D0D1A] border ${k.border} rounded-2xl p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{k.label}</p>
                  <k.icon size={16} className={k.iconColor} />
                </div>
                <p className={`font-sans text-4xl ${k.color}`}>{k.value}</p>
                <p className="text-sm font-bold text-orange-400 mt-1">{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-[#00C896]/10 to-[#00b085]/5 border border-[#00C896]/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={18} className="text-[#00C896]" />
              <p className="font-sans text-xl text-[#00C896] tracking-wider">DISTRIBUCIÓN DEL POZO — ${totalPot}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{p:'1°',pct:60,color:'text-[#00C896]'},{p:'2°',pct:30,color:'text-gray-300'},{p:'3°',pct:10,color:'text-orange-400'}].map(({p,pct,color})=>(
                <div key={p} className="text-center bg-[#080812] rounded-xl p-4 border border-white/10">
                  <p className={`font-sans text-4xl ${color}`}>${Math.round(totalPot*pct/100)}</p>
                  <p className="text-sm font-bold text-white mt-1">{p}</p>
                  <p className="text-sm font-bold text-orange-400">{pct}%</p>
                </div>
              ))}
            </div>
          </div>

          {(profiles.filter(p => p.inscription_status !== 'paid').length > 0 || pendingPayments > 0) && (
            <div className="bg-[#0D0D1A] border border-red-500/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Bell size={16} className="text-red-400" />
                <p className="font-sans text-lg text-red-400 tracking-wider">ALERTAS</p>
              </div>
              <div className="space-y-2">
                {profiles.filter(p => p.inscription_status !== 'paid').length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-red-400 font-semibold bg-red-500/5 rounded-xl px-3 py-2">
                    <AlertTriangle size={14} />
                    {profiles.filter(p => p.inscription_status !== 'paid').length} usuarios sin pagar inscripción
                  </div>
                )}
                {pendingPayments > 0 && (
                  <div className="flex items-center gap-2 text-sm text-[#00C896] font-semibold bg-[#00C896]/5 rounded-xl px-3 py-2">
                    <Clock size={14} />
                    {pendingPayments} comprobantes pendientes de aprobación
                  </div>
                )}
                {profiles.filter(p => (predByUser[p.id] || 0) === 0).length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-blue-400 font-semibold bg-blue-500/5 rounded-xl px-3 py-2">
                    <AlertTriangle size={14} />
                    {profiles.filter(p => (predByUser[p.id] || 0) === 0).length} usuarios sin predicciones
                  </div>
                )}
              </div>
            </div>
          )}
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
              <div key={p.id} className="bg-[#0D0D1A] border border-white/10 rounded-2xl p-4 hover:border-[#00C896]/30 transition-all">
                <div className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${status === 'green' ? 'bg-[#22C55E]' : status === 'yellow' ? 'bg-[#00C896]' : 'bg-red-500'}`} />
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.username} className="w-11 h-11 rounded-xl object-cover shrink-0 border border-white/10" />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-[#00C896]/20 border border-[#00C896]/20 flex items-center justify-center shrink-0">
                      <span className="font-sans text-xl text-[#00C896]">{p.username?.[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-base font-bold text-white">@{p.username}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.role === 'super_admin' ? 'bg-[#00C896]/20 text-[#00C896]' : p.role === 'admin' ? 'bg-[#A855F7]/20 text-[#A855F7]' : 'bg-[#2A2A4A] text-gray-400'}`}>{p.role || 'guest'}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.inscription_status === 'paid' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-red-500/20 text-red-400'}`}>{p.inscription_status === 'paid' ? 'Pagado' : 'Sin pagar'}</span>
                    </div>
                    <p className="text-sm font-bold text-orange-400 mb-1">{email}</p>
                    <p className="text-xs text-gray-400">{p.full_name} · {p.favorite_team}</p>
                    <div className="flex gap-4 mt-2 flex-wrap">
                      <span className="text-xs font-bold text-[#A855F7]">{preds} pred. · {points} pts</span>
                      <span className="text-xs font-bold text-[#22C55E]">{msgs} mensajes</span>
                      <span className="text-xs font-bold text-[#00C896]">{p.credits || 0} CR</span>
                      <span className="text-sm font-bold text-orange-400">Último acceso: {formatDate(lastSeen)}</span>
                    </div>
                    {p.role !== 'super_admin' && (
                      <div className="mt-2">
                        <select defaultValue={p.role || 'guest'} onChange={e => handleRoleChange(p.id, e.target.value)}
                          className="bg-[#080812] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00C896] cursor-pointer hover:border-[#00C896]/50 transition-all">
                          <option value="guest">Guest</option>
                          <option value="family">Family</option>
                          <option value="admin">Manager</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </div>
                    )}
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
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={16} className={pendingPayments > 0 ? 'text-[#00C896]' : 'text-[#22C55E]'} />
            <p className="text-sm font-bold text-white">{pendingPayments > 0 ? `${pendingPayments} comprobantes pendientes de revisión` : 'No hay comprobantes pendientes'}</p>
          </div>
          {payments.map(p => (
            <div key={p.id} className="bg-[#0D0D1A] border border-white/10 rounded-2xl p-4 hover:border-[#00C896]/30 transition-all">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {p.profiles?.avatar_url ? <img src={p.profiles.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover" /> : <div className="w-10 h-10 rounded-xl bg-[#00C896]/20 flex items-center justify-center"><span className="font-sans text-lg text-[#00C896]">{p.profiles?.username?.[0]?.toUpperCase()}</span></div>}
                  <div>
                    <p className="text-base font-bold text-white">@{p.profiles?.username}</p>
                    <p className="text-xs text-gray-400">{p.payment_method} · ${p.amount} · {formatDate(p.created_at)}</p>
                    {p.notes && <p className="text-xs text-[#86EFAC] mt-0.5">{p.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.status === 'approved' ? 'bg-[#22C55E]/20 text-[#22C55E]' : p.status === 'pending' ? 'bg-[#00C896]/20 text-[#00C896]' : 'bg-red-500/20 text-red-400'}`}>{p.status === 'approved' ? 'Aprobado' : p.status === 'pending' ? 'Pendiente' : 'Rechazado'}</span>
                  {p.status === 'pending' && <button onClick={() => handleApprovePayment(p.id, p.user_id, p.amount)} disabled={saving && approvingId === p.id} className="bg-[#22C55E] text-black font-bold px-3 py-1.5 rounded-xl text-xs disabled:opacity-40 hover:bg-[#16A34A] transition-all">Aprobar</button>}
                </div>
              </div>
            </div>
          ))}
          {payments.length === 0 && <div className="text-center py-12 text-gray-500"><DollarSign size={32} className="mx-auto mb-2 opacity-30" /><p>No hay comprobantes todavía</p></div>}
        </div>
      )}

      {/* CHAT */}
      {tab === 'chat' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={16} className="text-[#22C55E]" />
            <p className="text-sm font-bold text-white">Últimos {messages.length} mensajes del Chat del Quilombo</p>
          </div>
          <div className="bg-[#0D0D1A] border border-white/10 rounded-2xl overflow-hidden">
            <div className="divide-y divide-[#2A2A4A] max-h-[600px] overflow-y-auto">
              {messages.map((m: any) => (
                <div key={m.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-all">
                  <div className="w-8 h-8 rounded-xl bg-[#00C896]/20 flex items-center justify-center shrink-0"><span className="font-sans text-sm text-[#00C896]">{m.profiles?.username?.[0]?.toUpperCase() || '?'}</span></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><p className="text-sm font-bold text-[#22C55E]">@{m.profiles?.username || '?'}</p><p className="text-sm font-bold text-orange-400">{formatDate(m.created_at)}</p></div>
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
          <div className="bg-[#0D0D1A] border border-[#00C896]/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={18} className="text-[#00C896]" />
              <p className="font-sans text-xl text-[#00C896] tracking-wider">NUEVO DESAFÍO</p>
            </div>
            <div className="space-y-3">
              <div><p className="text-sm font-bold text-white mb-1.5">Partido</p>
                <select value={challengeMatch} onChange={e => setChallengeMatch(e.target.value)} className="w-full bg-[#080812] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C896]">
                  <option value="">Seleccioná un partido</option>
                  {matches.filter(m => m.status === 'scheduled').map(m => <option key={m.id} value={m.id}>{m.home_team} vs {m.away_team}</option>)}
                </select>
              </div>
              <div><p className="text-sm font-bold text-white mb-1.5">Título</p><input value={challengeTitle} onChange={e => setChallengeTitle(e.target.value)} placeholder="Ej: ¡$100 para quien acierte el marcador!" className="w-full bg-[#080812] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C896]" /></div>
              <div><p className="text-sm font-bold text-white mb-1.5">Descripción (opcional)</p><textarea value={challengeDesc} onChange={e => setChallengeDesc(e.target.value)} rows={2} placeholder="Detalles..." className="w-full bg-[#080812] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C896] resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-sm font-bold text-white mb-1.5">Premio USD</p><input type="number" value={challengePrize} onChange={e => setChallengePrize(e.target.value)} placeholder="100" className="w-full bg-[#080812] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C896]" /></div>
                <div><p className="text-sm font-bold text-white mb-1.5">Puntos bonus</p><input type="number" value={challengePoints} onChange={e => setChallengePoints(e.target.value)} placeholder="50" className="w-full bg-[#080812] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C896]" /></div>
              </div>
              <button onClick={handleCreateChallenge} disabled={saving} className="w-full bg-gradient-to-r from-[#00C896] to-[#00b085] text-black font-bold py-3 rounded-xl text-sm disabled:opacity-40 hover:opacity-90 transition-all flex items-center justify-center gap-2">
                <Zap size={16} />{saving ? 'Creando...' : 'Crear Desafío'}
              </button>
            </div>
          </div>
          {challenges.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-white">Desafíos activos</p>
              {challenges.map((c: any) => (
                <div key={c.id} className="bg-[#0D0D1A] border border-white/10 rounded-2xl p-4">
                  <p className="text-base font-bold text-[#00C896]">{c.title}</p>
                  <p className="text-sm text-white">{c.matches?.home_team} vs {c.matches?.away_team}</p>
                  {c.description && <p className="text-xs text-gray-400 mt-1">{c.description}</p>}
                  <div className="flex gap-3 mt-2">
                    {c.prize_amount > 0 && <span className="text-xs font-bold text-[#22C55E]">${c.prize_amount} premio</span>}
                    {c.bonus_points > 0 && <span className="text-xs font-bold text-[#A855F7]">+{c.bonus_points} pts</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RESULTADOS */}
      {tab === 'resultados' && (
        <div className="text-center py-12">
          <Zap size={48} className="text-[#00C896] mx-auto mb-4 opacity-60" />
          <p className="text-white font-bold mb-2">Cargá los resultados desde el panel de manager</p>
          <p className="text-gray-400 text-sm mb-6">El sistema calcula puntos automáticamente.</p>
          <Link href="/admin" className="inline-flex items-center gap-2 bg-[#00C896] text-black font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#FFA500] transition-all">
            <Zap size={16} /> Ir al Panel de Resultados
          </Link>
        </div>
      )}
    </div>
  )
}
