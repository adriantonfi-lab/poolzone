'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Lock, Clock, CheckCircle, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Match = {
  id: string
  home_team: string
  away_team: string
  home_team_code: string
  away_team_code: string
  match_date: string
  status: string
  stage: string
  group_name: string | null
}

type Prediction = {
  match_id: string
  predicted_winner: string
  predicted_home_score: number | null
  predicted_away_score: number | null
  predicted_scorers: string[]
  predicted_first_half_goals: number | null
  predicted_second_half_goals: number | null
  predicted_penalties: boolean
  prediction_level: number
  late_fee: number
  filled_at: string | null
}

function FlagImg({ code, size = 28 }: { code: string; size?: number }) {
  return (
    <img src={`https://flagcdn.com/40x30/${(code||'un').toLowerCase()}.png`}
      alt={code} width={size} height={Math.round(size * 0.75)}
      className="rounded-sm object-cover" />
  )
}

function getPredictionWindow(matchDate: string): { label: string; fee: number; multiplier: number; locked: boolean } {
  const now = Date.now()
  const kickoff = new Date(matchDate).getTime()
  const diff = kickoff - now
  const hoursLeft = diff / 3600000

  if (diff < 0) {
    // Partido empezado - ver si estamos en entretiempo (aprox 45-60 min)
    const minsPassed = Math.abs(diff) / 60000
    if (minsPassed >= 45 && minsPassed <= 65) {
      return { label: 'Entretiempo', fee: 8, multiplier: 0.25, locked: false }
    }
    return { label: 'Bloqueado', fee: 0, multiplier: 0, locked: true }
  }
  if (hoursLeft <= 1) return { label: 'Últimos 60 min — $5', fee: 5, multiplier: 0.5, locked: false }
  if (hoursLeft <= 24) return { label: 'Menos de 24hs — $2', fee: 2, multiplier: 0.75, locked: false }
  return { label: 'Gratis — puntaje completo', fee: 0, multiplier: 1, locked: false }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/New_York' })
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' })
}

const BASE_POINTS = {
  winner: 10,
  score: 15,
  scorer: 8,
  halves: 5,
  penalties: 10,
}

function MatchPredictionCard({
  match, prediction, onSave, saving
}: {
  match: Match
  prediction: Prediction | null
  onSave: (p: Partial<Prediction>) => void
  saving: boolean
}) {
  const [open, setOpen] = useState(false)
  const [winner, setWinner] = useState(prediction?.predicted_winner || '')
  const [homeScore, setHomeScore] = useState<string>(prediction?.predicted_home_score?.toString() || '')
  const [awayScore, setAwayScore] = useState<string>(prediction?.predicted_away_score?.toString() || '')
  const [scorers, setScorers] = useState(prediction?.predicted_scorers?.join(', ') || '')
  const [firstHalf, setFirstHalf] = useState<string>(prediction?.predicted_first_half_goals?.toString() || '')
  const [secondHalf, setSecondHalf] = useState<string>(prediction?.predicted_second_half_goals?.toString() || '')
  const [penalties, setPenalties] = useState(prediction?.predicted_penalties || false)

  const window = getPredictionWindow(match.match_date)
  const isSaved = !!prediction?.filled_at
  const isElim = match.stage !== 'Group Stage'

  // Calcular puntos potenciales
  let maxPoints = BASE_POINTS.winner
  if (homeScore !== '' && awayScore !== '') maxPoints += BASE_POINTS.score
  if (scorers.trim()) maxPoints += BASE_POINTS.scorer
  if (firstHalf !== '' || secondHalf !== '') maxPoints += BASE_POINTS.halves
  if (penalties && isElim) maxPoints += BASE_POINTS.penalties
  const earnablePoints = Math.round(maxPoints * window.multiplier)

  function handleSave() {
    if (!winner) return
    onSave({
      match_id: match.id,
      predicted_winner: winner,
      predicted_home_score: homeScore !== '' ? parseInt(homeScore) : null,
      predicted_away_score: awayScore !== '' ? parseInt(awayScore) : null,
      predicted_scorers: scorers.trim() ? scorers.split(',').map(s => s.trim()).filter(Boolean) : [],
      predicted_first_half_goals: firstHalf !== '' ? parseInt(firstHalf) : null,
      predicted_second_half_goals: secondHalf !== '' ? parseInt(secondHalf) : null,
      predicted_penalties: penalties,
      prediction_level: 1,
      late_fee: window.fee,
    })
  }

  return (
    <div className={`bg-[#1A1A2E] border-2 rounded-2xl overflow-hidden mb-3 ${
      isSaved ? 'border-[#22C55E]/60' : window.locked ? 'border-red-500/30' : 'border-[#2A2A4A]'
    }`}>
      {/* Header del partido */}
      <button onClick={() => !window.locked && setOpen(o => !o)}
        className="w-full px-4 py-3 flex items-center justify-between">
        {/* Status indicator */}
        <div className={`w-1 h-8 rounded-full mr-3 shrink-0 ${
          isSaved ? 'bg-[#22C55E]' : window.locked ? 'bg-red-500' : 'bg-[#2A2A4A]'
        }`} />
        <div className="flex items-center gap-3 flex-1">
          <FlagImg code={match.home_team_code} size={24} />
          <span className="text-base font-bold text-white">{match.home_team}</span>
          <span className="text-[#FFD700] font-bebas text-lg">vs</span>
          <span className="text-base font-bold text-white">{match.away_team}</span>
          <FlagImg code={match.away_team_code} size={24} />
        </div>
        <div className="flex items-center gap-3 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-white font-semibold">{formatDate(match.match_date)}</p>
            <p className="text-xs text-[#86EFAC]">{formatTime(match.match_date)} ET</p>
          </div>
          {isSaved && <CheckCircle size={18} className="text-[#22C55E] shrink-0" />}
          {window.locked ? <Lock size={18} className="text-red-500 shrink-0" /> :
            open ? <ChevronUp size={18} className="text-gray-400 shrink-0" /> :
            <ChevronDown size={18} className="text-gray-400 shrink-0" />}
        </div>
      </button>

      {/* Fee badge */}
      {!window.locked && (
        <div className="px-4 pb-2 flex items-center justify-between">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            window.fee === 0 ? 'bg-[#22C55E]/20 text-[#22C55E]' :
            window.fee <= 2 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>{window.label}</span>
          <span className="text-xs text-[#FFD700] font-bold">+{earnablePoints} pts posibles</span>
        </div>
      )}

      {window.locked && (
        <div className="px-4 pb-3">
          <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
            🔒 Partido en curso — no se puede modificar
          </span>
        </div>
      )}

      {/* Formulario */}
      {open && !window.locked && (
        <div className="px-4 pb-4 space-y-4 border-t border-[#2A2A4A] pt-4">

          {/* Nivel 1: Ganador */}
          <div>
            <p className="text-sm font-bold text-white mb-2">
              Nivel 1 — Ganador <span className="text-[#FFD700]">(+{BASE_POINTS.winner} pts)</span>
            </p>
            <div className="flex gap-2">
              {[match.home_team, 'Empate', match.away_team].map(opt => (
                <button key={opt} onClick={() => setWinner(opt)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    winner === opt
                      ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                      : 'border-[#2A2A4A] bg-[#0D0D0D] text-white hover:border-[#FFD700]/40'
                  }`}>
                  {opt === match.home_team && <FlagImg code={match.home_team_code} size={18} />}
                  {opt === match.away_team && <FlagImg code={match.away_team_code} size={18} />}
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Nivel 2: Marcador */}
          <div>
            <p className="text-sm font-bold text-white mb-2">
              Nivel 2 — Marcador exacto <span className="text-[#A855F7]">(+{BASE_POINTS.score} pts)</span>
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1 text-center">{match.home_team}</p>
                <input type="number" min="0" max="20" value={homeScore}
                  onChange={e => setHomeScore(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-3 py-2 text-center text-xl font-bebas text-white focus:outline-none focus:border-[#A855F7]" />
              </div>
              <span className="font-bebas text-2xl text-white">-</span>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1 text-center">{match.away_team}</p>
                <input type="number" min="0" max="20" value={awayScore}
                  onChange={e => setAwayScore(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-3 py-2 text-center text-xl font-bebas text-white focus:outline-none focus:border-[#A855F7]" />
              </div>
            </div>
          </div>

          {/* Nivel 3: Goleadores */}
          <div>
            <p className="text-sm font-bold text-white mb-2">
              Nivel 3 — Goleador(es) <span className="text-blue-400">(+{BASE_POINTS.scorer} pts c/u)</span>
            </p>
            <input type="text" value={scorers} onChange={e => setScorers(e.target.value)}
              placeholder="Ej: Messi, Mbappé (separados por coma)"
              className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-2.5 text-base text-white focus:outline-none focus:border-blue-400" />
          </div>

          {/* Nivel 4: Goles por tiempo */}
          <div>
            <p className="text-sm font-bold text-white mb-2">
              Nivel 4 — Goles por tiempo <span className="text-orange-400">(+{BASE_POINTS.halves} pts)</span>
            </p>
            <div className="flex gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">1er tiempo</p>
                <input type="number" min="0" max="20" value={firstHalf}
                  onChange={e => setFirstHalf(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-3 py-2 text-center text-lg font-bebas text-white focus:outline-none focus:border-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">2do tiempo</p>
                <input type="number" min="0" max="20" value={secondHalf}
                  onChange={e => setSecondHalf(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-3 py-2 text-center text-lg font-bebas text-white focus:outline-none focus:border-orange-400" />
              </div>
            </div>
          </div>

          {/* Nivel 5: Penales (solo eliminatorias) */}
          {isElim && (
            <div>
              <p className="text-sm font-bold text-white mb-2">
                Nivel 5 — ¿Va a penales? <span className="text-red-400">(+{BASE_POINTS.penalties} pts)</span>
              </p>
              <div className="flex gap-3">
                {[true, false].map(v => (
                  <button key={String(v)} onClick={() => setPenalties(v)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                      penalties === v
                        ? 'border-red-400 bg-red-400/10 text-red-400'
                        : 'border-[#2A2A4A] bg-[#0D0D0D] text-white'
                    }`}>
                    {v ? '⚽ Sí, penales' : '❌ No'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Guardar */}
          <button onClick={handleSave} disabled={!winner || saving}
            className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold py-3 rounded-xl text-base disabled:opacity-40 transition-all">
            {saving ? 'Guardando...' : window.fee > 0
              ? `💰 Guardar y pagar $${window.fee} — +${earnablePoints} pts`
              : `✅ Guardar predicción — +${earnablePoints} pts`}
          </button>
        </div>
      )}
    </div>
  )
}

export default function PredictionsPage() {
  const [userId, setUserId] = useState('')
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [totalPoints, setTotalPoints] = useState(0)
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)

      Promise.all([
        supabase.from('profiles').select('username, credits, avatar_url').eq('id', user.id).single(),
        supabase.from('matches').select('*').order('match_date', { ascending: true }),
        supabase.from('predictions').select('*').eq('user_id', user.id),
      ]).then(([profileRes, matchesRes, predsRes]) => {
        setUsername(profileRes.data?.username || '')
        setAvatarUrl(profileRes.data?.avatar_url || null)
        setMatches(matchesRes.data || [])
        const predsMap: Record<string, Prediction> = {}
        let pts = 0
        let count = 0
        for (const p of predsRes.data || []) {
          predsMap[p.match_id] = p
          pts += p.points_earned || 0
          if (p.filled_at) count++
        }
        setPredictions(predsMap)
        setTotalPoints(pts)
        setSavedCount(count)
        setLoading(false)
      })
    })
  }, [])

  async function handleSave(pred: Partial<Prediction>) {
    setSaving(true)
    const res = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...pred, userId }),
    })
    const data = await res.json()
    if (data.success) {
      setPredictions(p => ({ ...p, [pred.match_id!]: { ...p[pred.match_id!], ...pred, filled_at: new Date().toISOString() } as Prediction }))
      setSavedCount(c => c + 1)
    }
    setSaving(false)
  }

  const groupMatches = matches.filter(m => m.stage === 'Group Stage')
  const knockoutMatches = matches.filter(m => m.stage !== 'Group Stage')

  const groups: Record<string, Match[]> = {}
  for (const m of groupMatches) {
    const g = m.group_name || 'X'
    if (!groups[g]) groups[g] = []
    groups[g].push(m)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-white font-bebas text-2xl animate-pulse">Cargando...</div>
    </div>
  )

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto pb-24 md:pb-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-base font-bold text-white hover:text-[#FFD700] transition-colors mb-4">
        <ArrowLeft size={20} />Volver al Dashboard
      </Link>

      {/* Header */}
      <div className="bg-[#1A1A2E] border border-[#FFD700]/30 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt={username}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#FFD700]/40 shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#FFD700]/20 border-2 border-[#FFD700]/30 flex items-center justify-center shrink-0">
                <span className="font-bebas text-3xl text-[#FFD700]">{username?.[0]?.toUpperCase() || '?'}</span>
              </div>
            )}
            <div>
              <h1 className="font-bebas text-3xl text-[#FFD700] tracking-wider leading-none">Mi Polla</h1>
              <p className="text-base text-white font-semibold">@{username}</p>
              <p className="text-xs text-[#86EFAC] font-bold">Mundial 2026</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bebas text-5xl text-[#FFD700]">{totalPoints}</p>
            <p className="text-xs font-bold text-white uppercase tracking-wider">puntos</p>
          </div>
        </div>
        <div className="flex gap-4 mt-4 border-t border-[#2A2A4A] pt-3">
          <div>
            <p className="font-bebas text-2xl text-[#22C55E]">{savedCount}</p>
            <p className="text-xs text-white font-bold">predicciones guardadas</p>
          </div>
          <div>
            <p className="font-bebas text-2xl text-white">{matches.length - savedCount}</p>
            <p className="text-xs text-white font-bold">pendientes</p>
          </div>
          <div className="ml-auto">
            <div className="w-32 h-2 bg-[#2A2A4A] rounded-full overflow-hidden">
              <div className="h-full bg-[#FFD700] rounded-full transition-all"
                style={{ width: `${matches.length > 0 ? (savedCount / matches.length) * 100 : 0}%` }} />
            </div>
            <p className="text-xs text-white font-bold mt-1 text-right">
              {matches.length > 0 ? Math.round((savedCount / matches.length) * 100) : 0}% completo
            </p>
          </div>
        </div>
      </div>

      {/* Sistema de puntos */}
      <div className="bg-[#0D0D0D] border border-[#2A2A4A] rounded-2xl p-4 mb-6">
        <p className="font-bebas text-lg text-white tracking-wider mb-3">SISTEMA DE PUNTOS</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {[
            { label: 'Ganador/Empate', pts: 10, color: 'text-[#FFD700]' },
            { label: 'Marcador exacto', pts: 15, color: 'text-[#A855F7]' },
            { label: 'Goleador', pts: 8, color: 'text-blue-400' },
            { label: 'Goles x tiempo', pts: 5, color: 'text-orange-400' },
            { label: 'Penales (elim.)', pts: 10, color: 'text-red-400' },
            { label: 'Llenar todo antes', pts: 100, color: 'text-[#22C55E]' },
          ].map(({ label, pts, color }) => (
            <div key={label} className="flex items-center justify-between bg-[#1A1A2E] rounded-xl px-3 py-2">
              <span className="text-white text-xs">{label}</span>
              <span className={`font-bebas text-lg ${color}`}>+{pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grupos */}
      {Object.keys(groups).sort().map(group => (
        <div key={group} className="mb-6">
          <h2 className="font-bebas text-2xl text-[#FFD700] tracking-wider mb-3">Grupo {group}</h2>
          {groups[group].map(m => (
            <MatchPredictionCard key={m.id} match={m}
              prediction={predictions[m.id] || null}
              onSave={handleSave} saving={saving} />
          ))}
        </div>
      ))}

      {/* Eliminatorias */}
      {knockoutMatches.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bebas text-2xl text-[#A855F7] tracking-wider mb-3">Eliminatorias</h2>
          {knockoutMatches.map(m => (
            <MatchPredictionCard key={m.id} match={m}
              prediction={predictions[m.id] || null}
              onSave={handleSave} saving={saving} />
          ))}
        </div>
      )}
    </div>
  )
}
