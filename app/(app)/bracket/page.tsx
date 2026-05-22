'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, ArrowLeft, Loader2, Users } from 'lucide-react'
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

function FlagImg({ code, size = 18 }: { code: string; size?: number }) {
  return (
    <img src={`https://flagcdn.com/40x30/${(code || 'un').toLowerCase()}.png`}
      alt={code} width={size} height={Math.round(size * 0.75)}
      className="rounded-sm object-cover flex-shrink-0" />
  )
}

function getWinner(match: Match): string | null {
  if (match.status !== 'finished' && match.status !== 'FT') return null
  if (match.home_score === null || match.away_score === null) return null
  if (match.home_score > match.away_score) return match.home_team
  if (match.away_score > match.home_score) return match.away_team
  return null
}

function MatchCard({ match, highlight = false, small = false }: { match: Match | null; highlight?: boolean; small?: boolean }) {
  const p = small ? 'p-1.5' : 'p-2'
  if (!match) {
    return (
      <div className={`rounded-xl border ${highlight ? 'border-[#FFD700]/40 bg-[#1A1A2E]' : 'border-[#2A2A4A] bg-[#111111]'} ${p} w-full`}>
        <div className="flex items-center gap-1.5 py-0.5">
          <div className="w-5 h-3.5 bg-[#2A2A4A] rounded-sm flex-shrink-0" />
          <span className="text-[11px] text-gray-600 flex-1">TBD</span>
        </div>
        <div className="border-t border-[#2A2A4A] my-0.5" />
        <div className="flex items-center gap-1.5 py-0.5">
          <div className="w-5 h-3.5 bg-[#2A2A4A] rounded-sm flex-shrink-0" />
          <span className="text-[11px] text-gray-600 flex-1">TBD</span>
        </div>
      </div>
    )
  }
  const winner = getWinner(match)
  const isFinished = match.status === 'finished' || match.status === 'FT'
  const isLive = match.status === 'live' || match.status === '1H' || match.status === '2H' || match.status === 'HT'
  return (
    <div className={`rounded-xl border ${highlight ? 'border-[#FFD700]/60 bg-[#1A1A2E] shadow-[0_0_12px_rgba(255,215,0,0.1)]' : 'border-[#2A2A4A] bg-[#111111]'} ${p} w-full relative`}>
      {isLive && <div className="absolute -top-1.5 right-2 flex items-center gap-1 bg-[#22C55E] rounded-full px-1.5 py-0.5"><span className="w-1 h-1 rounded-full bg-white animate-pulse" /><span className="text-[9px] text-white font-bold">EN VIVO</span></div>}
      <div className={`flex items-center gap-1.5 py-0.5 ${winner && winner !== match.home_team ? 'opacity-35' : ''}`}>
        <FlagImg code={match.home_team_code} size={16} />
        <span className={`text-[11px] flex-1 truncate ${winner === match.home_team ? 'text-[#FFD700] font-bold' : 'text-white font-medium'}`}>{match.home_team}</span>
        {(isFinished || isLive) && <span className={`text-[11px] font-bold ${winner === match.home_team ? 'text-[#FFD700]' : 'text-gray-400'}`}>{match.home_score ?? 0}</span>}
      </div>
      <div className="border-t border-[#2A2A4A]/60 my-0.5" />
      <div className={`flex items-center gap-1.5 py-0.5 ${winner && winner !== match.away_team ? 'opacity-35' : ''}`}>
        <FlagImg code={match.away_team_code} size={16} />
        <span className={`text-[11px] flex-1 truncate ${winner === match.away_team ? 'text-[#FFD700] font-bold' : 'text-white font-medium'}`}>{match.away_team}</span>
        {(isFinished || isLive) && <span className={`text-[11px] font-bold ${winner === match.away_team ? 'text-[#FFD700]' : 'text-gray-400'}`}>{match.away_score ?? 0}</span>}
      </div>
    </div>
  )
}

function MobileStage({ title, matches, color }: { title: string; matches: (Match | null)[]; color: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl overflow-hidden mb-3">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3">
        <span className={`font-bebas text-lg tracking-wider ${color}`}>{title}</span>
        <span className="text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-3 pb-3 grid grid-cols-1 gap-2 border-t border-[#2A2A4A]">{matches.map((m, i) => <div key={i} className="mt-2"><MatchCard match={m} /></div>)}</div>}
    </div>
  )
}

const CARD_W = 148
const CARD_H = 52
const COL_GAP = 28
const COL_W = CARD_W + COL_GAP

function ConnectorLines({ octavos, cuartos, semis, final, tercero }: { octavos: (Match|null)[], cuartos: (Match|null)[], semis: (Match|null)[], final: (Match|null)[], tercero: (Match|null)[] }) {
  const totalW = 7 * COL_W + CARD_W
  const totalH = 900

  const octLeft = [0, 1, 2, 3]
  const octRight = [4, 5, 6, 7]

  const getOctY = (i: number) => 80 + i * (CARD_H + 16)
  const getCuartY = (i: number) => 80 + i * (CARD_H * 2 + 32) + CARD_H / 2 + 8
  const getSemiY = (i: number) => 80 + i * (CARD_H * 4 + 64) + CARD_H + 24
  const getFinalY = () => totalH / 2 - CARD_H / 2 - 20
  const getTerceroY = () => totalH / 2 + CARD_H + 20

  const col = (i: number) => i * COL_W

  const lines: JSX.Element[] = []
  const color = '#2A2A4A'
  const winColor = '#FFD700'

  octLeft.forEach((_, i) => {
    const pair = Math.floor(i / 2)
    const x1 = col(0) + CARD_W
    const y1 = getOctY(i) + CARD_H / 2
    const x2 = col(1)
    const y2 = getCuartY(pair)
    lines.push(<path key={`ol${i}`} d={`M ${x1} ${y1} H ${(x1+x2)/2} V ${y2} H ${x2}`} stroke={color} strokeWidth="1.5" fill="none" />)
  })

  octRight.forEach((_, i) => {
    const pair = Math.floor(i / 2)
    const x1 = col(6)
    const y1 = getOctY(i) + CARD_H / 2
    const x2 = col(6) + CARD_W
    lines.push(<path key={`or${i}`} d={`M ${x1} ${y1} H ${(x1+col(5)+CARD_W)/2} V ${getCuartY(pair + 2)} H ${col(5)+CARD_W}`} stroke={color} strokeWidth="1.5" fill="none" />)
  })

  const cuartLeft = [0, 1]
  cuartLeft.forEach((_, i) => {
    const x1 = col(1) + CARD_W
    const y1 = getCuartY(i)
    const x2 = col(2)
    const y2 = getSemiY(0)
    lines.push(<path key={`cl${i}`} d={`M ${x1} ${y1} H ${(x1+x2)/2} V ${y2} H ${x2}`} stroke={color} strokeWidth="1.5" fill="none" />)
  })

  const cuartRight = [2, 3]
  cuartRight.forEach((_, i) => {
    const x1 = col(5)
    const y1 = getCuartY(i + 2)
    const x2 = col(4) + CARD_W
    lines.push(<path key={`cr${i}`} d={`M ${x1} ${y1} H ${(x1+x2)/2} V ${getSemiY(1)} H ${x2}`} stroke={color} strokeWidth="1.5" fill="none" />)
  })

  const semiLX1 = col(2) + CARD_W
  const semiLY = getSemiY(0)
  const finalX = col(3)
  const finalY = getFinalY() + CARD_H / 2
  lines.push(<path key="sl" d={`M ${semiLX1} ${semiLY} H ${(semiLX1+finalX)/2} V ${finalY} H ${finalX}`} stroke={color} strokeWidth="1.5" fill="none" />)

  const semiRX1 = col(4)
  const semiRY = getSemiY(1)
  const finalRX = col(3) + CARD_W
  lines.push(<path key="sr" d={`M ${semiRX1} ${semiRY} H ${(semiRX1+finalRX)/2} V ${finalY} H ${finalRX}`} stroke={color} strokeWidth="1.5" fill="none" />)

  lines.push(<path key="t1" d={`M ${semiLX1} ${semiLY} H ${semiLX1 + 14} V ${getTerceroY() + CARD_H/2} H ${finalX}`} stroke={color} strokeWidth="1" strokeDasharray="4 3" fill="none" />)
  lines.push(<path key="t2" d={`M ${semiRX1} ${semiRY} H ${semiRX1 - 14} V ${getTerceroY() + CARD_H/2} H ${finalRX}`} stroke={color} strokeWidth="1" strokeDasharray="4 3" fill="none" />)

  return (
    <svg className="absolute inset-0 pointer-events-none" width={totalW} height={totalH} style={{overflow:'visible'}}>
      {lines}
    </svg>
  )
}

export default function BracketPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('matches').select('*').neq('stage', 'Group Stage').order('match_date', { ascending: true })
      .then(({ data }) => { setMatches(data || []); setLoading(false) })
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-[#FFD700]" /></div>

  const pad = (arr: Match[], n: number): (Match | null)[] => { const r: (Match | null)[] = [...arr]; while (r.length < n) r.push(null); return r }

  const octavos = pad(matches.filter(m => m.stage === 'Octavos de Final'), 8)
  const cuartos = pad(matches.filter(m => m.stage === 'Cuartos de Final'), 4)
  const semis = pad(matches.filter(m => m.stage === 'Semifinal'), 2)
  const tercero = pad(matches.filter(m => m.stage === 'Tercer Puesto'), 1)
  const final = pad(matches.filter(m => m.stage === 'Final'), 1)

  const cardH = CARD_H
  const cardW = CARD_W
  const gap = 16
  const totalW = 7 * COL_W + cardW
  const totalH = 900

  const getOctY = (i: number) => 80 + i * (cardH + gap)
  const getCuartY = (i: number) => 80 + i * (cardH * 2 + gap * 2) + cardH / 2 + gap / 2
  const getSemiY = (i: number) => 80 + i * (cardH * 4 + gap * 4) + cardH + gap
  const getFinalY = () => totalH / 2 - cardH / 2 - 20
  const getTerceroY = () => totalH / 2 + cardH + 20
  const col = (i: number) => i * COL_W

  const stageLabel = (text: string, x: number, color: string) => (
    <div className="absolute font-bebas text-xs tracking-wider text-center" style={{ left: x, top: 56, width: cardW, color }}>{text}</div>
  )

  return (
    <div className="px-4 py-6 max-w-full mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors mb-5">
        <ArrowLeft size={16} />Volver
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#FFD700]/20 flex items-center justify-center">
          <Trophy size={20} className="text-[#FFD700]" />
        </div>
        <div>
          <h1 className="font-bebas text-3xl text-white tracking-wider leading-none">CUADRO ELIMINATORIO</h1>
          <p className="text-xs text-[#86EFAC] font-semibold">FIFA World Cup 2026™</p>
        </div>
        <Link href="/grupos" className="ml-auto flex items-center gap-2 bg-[#1A1A2E] border border-[#2A2A4A] text-gray-300 font-bold px-3 py-2 rounded-xl text-xs hover:border-[#FFD700]/50 hover:text-white transition-all">
          <Users size={14} />Fase de Grupos
        </Link>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block overflow-x-auto pb-6">
        <div className="relative" style={{ width: totalW, height: totalH }}>
          {/* Labels */}
          {stageLabel('OCTAVOS', col(0), '#A855F7')}
          {stageLabel('CUARTOS', col(1), '#A855F7')}
          {stageLabel('SEMI', col(2), '#A855F7')}
          <div className="absolute font-bebas text-sm tracking-wider text-center text-[#FFD700]" style={{ left: col(3), top: 56, width: cardW }}>🏆 FINAL</div>
          {stageLabel('SEMI', col(4), '#A855F7')}
          {stageLabel('CUARTOS', col(5), '#A855F7')}
          {stageLabel('OCTAVOS', col(6), '#A855F7')}

          {/* 3er puesto label */}
          <div className="absolute font-bebas text-xs tracking-wider text-center text-gray-500" style={{ left: col(3), top: getTerceroY() - 16, width: cardW }}>3° PUESTO</div>

          {/* Lines */}
          <svg className="absolute inset-0 pointer-events-none" width={totalW} height={totalH} style={{overflow:'visible'}}>
            {octavos.slice(0,4).map((_, i) => {
              const pair = Math.floor(i / 2)
              const x1 = col(0) + cardW; const y1 = getOctY(i) + cardH / 2
              const x2 = col(1); const y2 = getCuartY(pair)
              return <path key={`ol${i}`} d={`M ${x1} ${y1} H ${(x1+x2)/2} V ${y2} H ${x2}`} stroke="#2A2A4A" strokeWidth="1.5" fill="none" />
            })}
            {octavos.slice(4,8).map((_, i) => {
              const pair = Math.floor(i / 2)
              const x1 = col(6); const y1 = getOctY(i) + cardH / 2
              const x2 = col(5) + cardW; const y2 = getCuartY(pair + 2)
              return <path key={`or${i}`} d={`M ${x1} ${y1} H ${(x1+x2)/2} V ${y2} H ${x2}`} stroke="#2A2A4A" strokeWidth="1.5" fill="none" />
            })}
            {[0,1].map(i => {
              const x1 = col(1) + cardW; const y1 = getCuartY(i)
              const x2 = col(2); const y2 = getSemiY(0)
              return <path key={`cl${i}`} d={`M ${x1} ${y1} H ${(x1+x2)/2} V ${y2} H ${x2}`} stroke="#2A2A4A" strokeWidth="1.5" fill="none" />
            })}
            {[0,1].map(i => {
              const x1 = col(5); const y1 = getCuartY(i + 2)
              const x2 = col(4) + cardW; const y2 = getSemiY(1)
              return <path key={`cr${i}`} d={`M ${x1} ${y1} H ${(x1+x2)/2} V ${y2} H ${x2}`} stroke="#2A2A4A" strokeWidth="1.5" fill="none" />
            })}
            <path d={`M ${col(2)+cardW} ${getSemiY(0)} H ${(col(2)+cardW+col(3))/2} V ${getFinalY()+cardH/2} H ${col(3)}`} stroke="#2A2A4A" strokeWidth="1.5" fill="none" />
            <path d={`M ${col(4)} ${getSemiY(1)} H ${(col(4)+col(3)+cardW)/2} V ${getFinalY()+cardH/2} H ${col(3)+cardW}`} stroke="#2A2A4A" strokeWidth="1.5" fill="none" />
            <path d={`M ${col(2)+cardW} ${getSemiY(0)} H ${col(2)+cardW+20} V ${getTerceroY()+cardH/2} H ${col(3)}`} stroke="#3A3A5A" strokeWidth="1" strokeDasharray="5 3" fill="none" />
            <path d={`M ${col(4)} ${getSemiY(1)} H ${col(4)-20} V ${getTerceroY()+cardH/2} H ${col(3)+cardW}`} stroke="#3A3A5A" strokeWidth="1" strokeDasharray="5 3" fill="none" />
          </svg>

          {/* Left Octavos */}
          {octavos.slice(0,4).map((m, i) => (
            <div key={i} className="absolute" style={{ left: col(0), top: getOctY(i), width: cardW }}>
              <MatchCard match={m} />
            </div>
          ))}

          {/* Left Cuartos */}
          {cuartos.slice(0,2).map((m, i) => (
            <div key={i} className="absolute" style={{ left: col(1), top: getCuartY(i) - cardH/2, width: cardW }}>
              <MatchCard match={m} />
            </div>
          ))}

          {/* Left Semi */}
          <div className="absolute" style={{ left: col(2), top: getSemiY(0) - cardH/2, width: cardW }}>
            <MatchCard match={semis[0]} />
          </div>

          {/* Final */}
          <div className="absolute" style={{ left: col(3), top: getFinalY(), width: cardW }}>
            <MatchCard match={final[0]} highlight />
          </div>

          {/* Tercer puesto */}
          <div className="absolute" style={{ left: col(3), top: getTerceroY(), width: cardW }}>
            <MatchCard match={tercero[0]} />
          </div>

          {/* Right Semi */}
          <div className="absolute" style={{ left: col(4), top: getSemiY(1) - cardH/2, width: cardW }}>
            <MatchCard match={semis[1]} />
          </div>

          {/* Right Cuartos */}
          {cuartos.slice(2,4).map((m, i) => (
            <div key={i} className="absolute" style={{ left: col(5), top: getCuartY(i+2) - cardH/2, width: cardW }}>
              <MatchCard match={m} />
            </div>
          ))}

          {/* Right Octavos */}
          {octavos.slice(4,8).map((m, i) => (
            <div key={i} className="absolute" style={{ left: col(6), top: getOctY(i), width: cardW }}>
              <MatchCard match={m} />
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE */}
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
