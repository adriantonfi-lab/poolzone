'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

type Match = {
  id: string
  home_team: string
  away_team: string
  home_team_code: string
  away_team_code: string
  home_score: number | null
  away_score: number | null
  status: string
  match_date: string
  stage: string
  group_name: string | null
}

function FlagImg({ code, size = 20 }: { code: string; size?: number }) {
  const normalized = (code || 'un').toLowerCase()
  return (
    <img src={`https://flagcdn.com/40x30/${normalized}.png`} alt={code} width={size} height={Math.round(size * 0.75)} className="rounded-sm object-cover flex-shrink-0" />
  )
}

function getWinner(match: Match): string | null {
  if (match.status !== 'finished' && match.status !== 'FT') return null
  if (match.home_score === null || match.away_score === null) return null
  if (match.home_score > match.away_score) return match.home_team
  if (match.away_score > match.home_score) return match.away_team
  return null
}

function MatchCard({ match, highlight = false }: { match: Match | null; highlight?: boolean }) {
  if (!match) {
    return (
      <div className={`rounded-xl border ${highlight ? 'border-[#FFD700]/30 bg-[#1A1A2E]' : 'border-[#2A2A4A] bg-[#0D0D0D]'} p-2 min-w-[140px] w-full`}>
        <div className="flex items-center gap-2 py-1"><div className="w-5 h-4 bg-[#2A2A4A] rounded-sm" /><span className="text-xs text-gray-600 flex-1">TBD</span></div>
        <div className="border-t border-[#2A2A4A] my-1" />
        <div className="flex items-center gap-2 py-1"><div className="w-5 h-4 bg-[#2A2A4A] rounded-sm" /><span className="text-xs text-gray-600 flex-1">TBD</span></div>
      </div>
    )
  }
  const winner = getWinner(match)
  const isFinished = match.status === 'finished' || match.status === 'FT'
  const isLive = match.status === 'live' || match.status === '1H' || match.status === '2H' || match.status === 'HT'
  return (
    <div className={`rounded-xl border ${highlight ? 'border-[#FFD700]/50 bg-[#1A1A2E]' : 'border-[#2A2A4A] bg-[#0D0D0D]'} p-2 min-w-[140px] w-full relative overflow-hidden`}>
      {isLive && (<div className="absolute top-1 right-1"><span className="flex items-center gap-1 text-[10px] text-[#22C55E] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />LIVE</span></div>)}
      <div className={`flex items-center gap-2 py-1 ${winner && winner !== match.home_team ? 'opacity-40' : ''}`}>
        <FlagImg code={match.home_team_code} size={18} />
        <span className={`text-xs flex-1 truncate ${winner === match.home_team ? 'text-[#FFD700] font-bold' : 'text-white font-semibold'}`}>{match.home_team}</span>
        {(isFinished || isLive) && <span className={`text-xs font-bold ${winner === match.home_team ? 'text-[#FFD700]' : 'text-white'}`}>{match.home_score ?? 0}</span>}
      </div>
      <div className="border-t border-[#2A2A4A] my-0.5" />
      <div className={`flex items-center gap-2 py-1 ${winner && winner !== match.away_team ? 'opacity-40' : ''}`}>
        <FlagImg code={match.away_team_code} size={18} />
        <span className={`text-xs flex-1 truncate ${winner === match.away_team ? 'text-[#FFD700] font-bold' : 'text-white font-semibold'}`}>{match.away_team}</span>
        {(isFinished || isLive) && <span className={`text-xs font-bold ${winner === match.away_team ? 'text-[#FFD700]' : 'text-white'}`}>{match.away_score ?? 0}</span>}
      </div>
    </div>
  )
}

function MobileStage({ title, matches, color }: { title: string; matches: (Match | null)[]; color: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl overflow-hidden mb-3">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3">
        <span className={`font-bebas text-xl tracking-wider ${color}`}>{title}</span>
        <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>
      {open && (<div className="px-4 pb-4 grid grid-cols-1 gap-3">{matches.map((match, i) => <MatchCard key={i} match={match} />)}</div>)}
    </div>
  )
}

export default function BracketPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('matches').select('*').neq('stage', 'Group Stage').order('match_date', { ascending: true }).then(({ data }) => {
      setMatches(data || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-[#FFD700]" /></div>

  const pad = (arr: Match[], n: number): (Match | null)[] => { const r: (Match | null)[] = [...arr]; while (r.length < n) r.push(null); return r }

  const octavos = pad(matches.filter(m => m.stage === 'Octavos de Final'), 8)
  const cuartos = pad(matches.filter(m => m.stage === 'Cuartos de Final'), 4)
  const semis = pad(matches.filter(m => m.stage === 'Semifinal'), 2)
  const tercero = pad(matches.filter(m => m.stage === 'Tercer Puesto'), 1)
  const final = pad(matches.filter(m => m.stage === 'Final'), 1)

  return (
    <div className="px-4 py-6 max-w-full mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-base font-bold text-white hover:text-[#FFD700] transition-colors mb-4"><ArrowLeft size={20} />Volver</Link>
      <div className="flex items-center gap-3 mb-6">
        <Trophy size={28} className="text-[#FFD700]" />
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-wider leading-none">CUADRO ELIMINATORIO</h1>
          <p className="text-sm text-[#86EFAC] font-semibold">FIFA World Cup 2026™</p>
        </div>
      </div>
      <div className="hidden md:flex gap-4 items-start overflow-x-auto pb-4 min-w-max px-2">
        <div className="flex flex-col gap-3 min-w-[155px]"><div className="text-center font-bebas text-sm mb-1 text-[#A855F7]">OCTAVOS DE FINAL</div>{octavos.slice(0,4).map((m,i) => <MatchCard key={i} match={m} />)}</div>
        <div className="flex flex-col gap-3 min-w-[155px] mt-8"><div className="text-center font-bebas text-sm mb-1 text-[#A855F7]">CUARTOS DE FINAL</div>{cuartos.slice(0,2).map((m,i) => <div key={i} className="mt-6"><MatchCard match={m} /></div>)}</div>
        <div className="flex flex-col gap-3 min-w-[155px] mt-20"><div className="text-center font-bebas text-sm mb-1 text-[#A855F7]">SEMIFINAL</div>{semis.slice(0,1).map((m,i) => <div key={i} className="mt-10"><MatchCard match={m} /></div>)}</div>
        <div className="flex flex-col gap-4 min-w-[155px] mt-40">
          <div className="text-center font-bebas text-sm mb-1 text-[#FFD700]">🏆 GRAN FINAL</div>
          {final.map((m,i) => <MatchCard key={i} match={m} highlight />)}
          <div className="mt-4 text-center font-bebas text-sm text-gray-400">3° PUESTO</div>
          {tercero.map((m,i) => <MatchCard key={i} match={m} />)}
        </div>
        <div className="flex flex-col gap-3 min-w-[155px] mt-20"><div className="text-center font-bebas text-sm mb-1 text-[#A855F7]">SEMIFINAL</div>{semis.slice(1,2).map((m,i) => <div key={i} className="mt-10"><MatchCard match={m} /></div>)}</div>
        <div className="flex flex-col gap-3 min-w-[155px] mt-8"><div className="text-center font-bebas text-sm mb-1 text-[#A855F7]">CUARTOS DE FINAL</div>{cuartos.slice(2,4).map((m,i) => <div key={i} className="mt-6"><MatchCard match={m} /></div>)}</div>
        <div className="flex flex-col gap-3 min-w-[155px]"><div className="text-center font-bebas text-sm mb-1 text-[#A855F7]">OCTAVOS DE FINAL</div>{octavos.slice(4,8).map((m,i) => <MatchCard key={i} match={m} />)}</div>
      </div>
      <div className="md:hidden">
        <MobileStage title="OCTAVOS DE FINAL" matches={octavos} color="text-[#A855F7]" />
        <MobileStage title="CUARTOS DE FINAL" matches={cuartos} color="text-[#A855F7]" />
        <MobileStage title="SEMIFINAL" matches={semis} color="text-[#A855F7]" />
        <MobileStage title="TERCER PUESTO" matches={tercero} color="text-gray-400" />
        <MobileStage title="🏆 GRAN FINAL" matches={final} color="text-[#FFD700]" />
      </div>
    </div>
  )
}
