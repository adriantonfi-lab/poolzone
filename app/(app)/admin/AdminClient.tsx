'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Trophy, Settings, CheckCircle, XCircle, Clock, Key, Search } from 'lucide-react'

type User = {
  id: string
  username: string
  full_name: string
  avatar_url: string | null
  role: string
  credits: number
  favorite_team: string
  created_at: string
  is_online: boolean
}

type Match = {
  id: string
  home_team: string
  away_team: string
  home_team_code: string
  away_team_code: string
  match_date: string
  status: string
  home_score: number | null
  away_score: number | null
  stage: string
  group_name: string | null
}

type Prediction = {
  id: string
  user_id: string
  match_id: string
  points_earned: number
  filled_at: string | null
}

type Tab = 'usuarios' | 'resultados' | 'codigos'

function FlagImg({ code, size = 20 }: { code: string; size?: number }) {
  return (
    <img src={`https://flagcdn.com/40x30/${(code||'un').toLowerCase()}.png`}
      alt={code} width={size} height={Math.round(size * 0.75)}
      className="rounded-sm object-cover" />
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'America/New_York' })
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' })
}

export default function AdminClient({ currentUser, users, matches, predictions }: {
  currentUser: { id: string; role: string; username: string }
  users: User[]
  matches: Match[]
  predictions: Prediction[]
}) {
  const [tab, setTab] = useState<Tab>('usuarios')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({})
  const [codes, setCodes] = useState<Record<string, string>>({})
  const isSuperAdmin = currentUser.role === 'super_admin'

  // Stats
  const totalPredictions = predictions.length
  const predsByMatch: Record<string, number> = {}
  for (const p of predictions) {
    predsByMatch[p.match_id] = (predsByMatch[p.match_id] || 0) + 1
  }

  async function handleSaveResult(matchId: string) {
    const s = scores[matchId]
    if (!s || s.home === '' || s.away === '') return
    setSaving(true)
    setMsg('')
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_result',
        matchId,
        homeScore: parseInt(s.home),
        awayScore: parseInt(s.away),
        userId: currentUser.id,
      }),
    })
    const data = await res.json()
    setMsg(data.success ? '✅ Resultado guardado y puntos calculados' : `❌ ${data.error}`)
    setSaving(false)
  }

  async function handleGenerateCode(matchId: string, targetUserId: string) {
    if (!isSuperAdmin) return
    setSaving(true)
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate_code', matchId, targetUserId, userId: currentUser.id }),
    })
    const data = await res.json()
    if (data.code) {
      setCodes(prev => ({ ...prev, [`${matchId}-${targetUserId}`]: data.code }))
      setMsg(`✅ Código generado: ${data.code}`)
    } else {
      setMsg(`❌ ${data.error}`)
    }
    setSaving(false)
  }

  async function handleRoleChange(targetId: string, newRole: string) {
    if (!isSuperAdmin) return
    setSaving(true)
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'change_role', targetId, newRole, userId: currentUser.id }),
    })
    const data = await res.json()
    setMsg(data.success ? '✅ Rol actualizado' : `❌ ${data.error}`)
    setSaving(false)
  }

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const upcomingMatches = matches.filter(m => m.status === 'scheduled' || m.status === 'live')
  const finishedMatches = matches.filter(m => m.status === 'finished')

  const btnBase = 'px-4 py-2 rounded-xl text-sm font-bold transition-all'
  const btnActive = 'bg-[#FFD700] text-black'
  const btnInactive = 'bg-[#1A1A2E] text-white border border-[#2A2A4A] hover:border-[#FFD700]'

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto pb-24 md:pb-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-base font-bold text-white hover:text-[#FFD700] transition-colors mb-4">
        <ArrowLeft size={20} />Dashboard
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-wider">Panel Admin</h1>
          <p className="text-sm font-semibold text-[#FFD700]">
            {isSuperAdmin ? '⭐ Super Admin' : '🔧 Admin'} — @{currentUser.username}
          </p>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-base font-semibold ${
          msg.startsWith('✅') ? 'bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]' : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>{msg}</div>
      )}

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-4 text-center">
          <Users size={18} className="text-[#22C55E] mx-auto mb-1" />
          <p className="font-bebas text-3xl text-white">{users.length}</p>
          <p className="text-xs font-bold text-white">Usuarios</p>
        </div>
        <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-4 text-center">
          <Trophy size={18} className="text-[#FFD700] mx-auto mb-1" />
          <p className="font-bebas text-3xl text-[#FFD700]">{totalPredictions}</p>
          <p className="text-xs font-bold text-white">Predicciones</p>
        </div>
        <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-4 text-center">
          <CheckCircle size={18} className="text-[#A855F7] mx-auto mb-1" />
          <p className="font-bebas text-3xl text-[#A855F7]">{finishedMatches.length}</p>
          <p className="text-xs font-bold text-white">Resultados</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button className={`${btnBase} ${tab === 'usuarios' ? btnActive : btnInactive}`} onClick={() => setTab('usuarios')}>
          <Users size={14} className="inline mr-1" />Usuarios
        </button>
        <button className={`${btnBase} ${tab === 'resultados' ? btnActive : btnInactive}`} onClick={() => setTab('resultados')}>
          <Trophy size={14} className="inline mr-1" />Resultados
        </button>
        {isSuperAdmin && (
          <button className={`${btnBase} ${tab === 'codigos' ? btnActive : btnInactive}`} onClick={() => setTab('codigos')}>
            <Key size={14} className="inline mr-1" />Códigos
          </button>
        )}
      </div>

      {/* TAB: USUARIOS */}
      {tab === 'usuarios' && (
        <div>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar usuario..."
              className="w-full bg-[#1A1A2E] border border-[#2A2A4A] rounded-xl pl-9 pr-4 py-2.5 text-base text-white focus:outline-none focus:border-[#FFD700]" />
          </div>
          <div className="space-y-2">
            {filteredUsers.map(u => {
              const userPreds = predictions.filter(p => p.user_id === u.id).length
              return (
                <div key={u.id} className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt={u.username} className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#FFD700]/20 flex items-center justify-center">
                        <span className="font-bebas text-lg text-[#FFD700]">{u.username?.[0]?.toUpperCase()}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-base font-bold text-white">@{u.username}</p>
                      <p className="text-xs text-gray-400">{u.full_name} · {u.favorite_team}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#86EFAC] font-bold">{userPreds} pred.</p>
                      <p className="text-xs text-[#FFD700] font-bold">{u.credits} CR</p>
                    </div>
                    {isSuperAdmin && u.id !== currentUser.id && (
                      <select
                        defaultValue={u.role || 'family'}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="bg-[#0D0D0D] border border-[#2A2A4A] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#FFD700]">
                        <option value="family">Family</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    )}
                    <div className={`w-2.5 h-2.5 rounded-full ${u.is_online ? 'bg-[#22C55E]' : 'bg-gray-600'}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB: RESULTADOS */}
      {tab === 'resultados' && (
        <div className="space-y-3">
          <p className="text-sm font-bold text-white mb-3">Cargá el resultado final — el sistema calcula los puntos automáticamente.</p>
          {upcomingMatches.map(m => (
            <div key={m.id} className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FlagImg code={m.home_team_code} size={20} />
                <span className="text-base font-bold text-white">{m.home_team}</span>
                <span className="text-[#FFD700] font-bebas">vs</span>
                <span className="text-base font-bold text-white">{m.away_team}</span>
                <FlagImg code={m.away_team_code} size={20} />
                <span className="text-xs text-gray-400 ml-auto">{formatDate(m.match_date)} · {formatTime(m.match_date)} ET</span>
                {m.status === 'live' && <span className="text-xs font-bold text-[#22C55E] animate-pulse">EN VIVO</span>}
              </div>
              <div className="flex items-center gap-3">
                <input type="number" min="0" max="20"
                  value={scores[m.id]?.home || ''}
                  onChange={e => setScores(p => ({ ...p, [m.id]: { ...p[m.id], home: e.target.value } }))}
                  placeholder="0"
                  className="w-16 bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-3 py-2 text-center text-xl font-bebas text-white focus:outline-none focus:border-[#FFD700]" />
                <span className="font-bebas text-xl text-white">-</span>
                <input type="number" min="0" max="20"
                  value={scores[m.id]?.away || ''}
                  onChange={e => setScores(p => ({ ...p, [m.id]: { ...p[m.id], away: e.target.value } }))}
                  placeholder="0"
                  className="w-16 bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-3 py-2 text-center text-xl font-bebas text-white focus:outline-none focus:border-[#FFD700]" />
                <button onClick={() => handleSaveResult(m.id)} disabled={saving}
                  className="ml-auto bg-[#FFD700] text-black font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-40 transition-all hover:bg-[#FFA500]">
                  Guardar resultado
                </button>
                <span className="text-xs text-gray-400">{predsByMatch[m.id] || 0} predicciones</span>
              </div>
            </div>
          ))}
          {upcomingMatches.length === 0 && (
            <p className="text-center text-white py-8">No hay partidos pendientes de resultado.</p>
          )}
        </div>
      )}

      {/* TAB: CODIGOS (solo super admin) */}
      {tab === 'codigos' && isSuperAdmin && (
        <div className="space-y-3">
          <p className="text-sm font-bold text-white mb-3">Generá códigos de un solo uso para que un usuario modifique su predicción después del cierre.</p>
          {upcomingMatches.map(m => (
            <div key={m.id} className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FlagImg code={m.home_team_code} size={18} />
                <span className="text-sm font-bold text-white">{m.home_team} vs {m.away_team}</span>
                <FlagImg code={m.away_team_code} size={18} />
                <span className="text-xs text-gray-400 ml-auto">{formatDate(m.match_date)}</span>
              </div>
              <div className="space-y-2">
                {users.filter(u => u.role !== 'super_admin').map(u => {
                  const codeKey = `${m.id}-${u.id}`
                  return (
                    <div key={u.id} className="flex items-center justify-between bg-[#0D0D0D] rounded-xl px-3 py-2">
                      <span className="text-sm text-white font-bold">@{u.username}</span>
                      {codes[codeKey] ? (
                        <span className="font-bebas text-lg text-[#FFD700] tracking-wider">{codes[codeKey]}</span>
                      ) : (
                        <button onClick={() => handleGenerateCode(m.id, u.id)} disabled={saving}
                          className="bg-[#A855F7] text-white font-bold px-3 py-1 rounded-lg text-xs disabled:opacity-40 hover:bg-[#7C3AED] transition-all">
                          <Key size={12} className="inline mr-1" />Generar código
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
