'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, ArrowLeft, Loader2, Users } from 'lucide-react'
import Link from 'next/link'

type Match = {
  id: string; home_team: string; away_team: string; home_team_code: string; away_team_code: string
  home_score: number | null; away_score: number | null; status: string; match_date: string; stage: string; group_name: string | null
}

function FlagImg({ code, size = 16 }: { code: string; size?: number }) {
  return <img src={`https://flagcdn.com/40x30/${(code||'un').toLowerCase()}.png`} alt={code} width={size} height={Math.round(size*0.75)} className="rounded-sm object-cover flex-shrink-0" />
}

function getWinner(match: Match): string | null {
  if (match.status !== 'finished' && match.status !== 'FT') return null
  if (match.home_score === null || match.away_score === null) return null
  if (match.home_score > match.away_score) return match.home_team
  if (match.away_score > match.home_score) return match.away_team
  return null
}

function MatchCard({ match, highlight = false }: { match: Match | null; highlight?: boolean }) {
  if (!match) return (
    <div className={`rounded-xl border ${highlight ? 'border-[#FFD700]/40 bg-[#1A1A2E]' : 'border-[#2A2A4A] bg-[#111111]'} p-2 w-full`}>
      <div className="flex items-center gap-1.5 py-0.5"><div className="w-5 h-3.5 bg-[#2A2A4A] rounded-sm flex-shrink-0" /><span className="text-[11px] text-gray-600 flex-1">TBD</span></div>
      <div className="border-t border-[#2A2A4A] my-0.5" />
      <div className="flex items-center gap-1.5 py-0.5"><div className="w-5 h-3.5 bg-[#2A2A4A] rounded-sm flex-shrink-0" /><span className="text-[11px] text-gray-600 flex-1">TBD</span></div>
    </div>
  )
  const winner = getWinner(match)
  const isFinished = match.status === 'finished' || match.status === 'FT'
  const isLive = match.status === 'live' || match.status === '1H' || match.status === '2H' || match.status === 'HT'
  return (
    <div className={`rounded-xl border ${highlight ? 'border-[#FFD700]/60 bg-[#1A1A2E] shadow-[0_0_12px_rgba(255,215,0,0.1)]' : 'border-[#2A2A4A] bg-[#111111]'} p-2 w-full relative`}>
      {isLive && <div className="absolute -top-2 right-2 flex items-center gap-1 bg-[#22C55E] rounded-full px-1.5 py-0.5"><span className="w-1 h-1 rounded-full bg-white animate-pulse" /><span className="text-[9px] text-white font-bold">EN VIVO</span></div>}
      <div className={`flex items-center gap-1.5 py-0.5 ${winner && winner !== match.home_team ? 'opacity-35' : ''}`}>
        <FlagImg code={match.home_team_code} />
        <span className={`text-[11px] flex-1 truncate ${winner === match.home_team ? 'text-[#FFD700] font-bold' : 'text-white font-medium'}`}>{match.home_team}</span>
        {(isFinished||isLive) && <span className={`text-[11px] font-bold ${winner === match.home_team ? 'text-[#FFD700]' : 'text-gray-400'}`}>{match.home_score??0}</span>}
      </div>
      <div className="border-t border-[#2A2A4A]/60 my-0.5" />
      <div className={`flex items-center gap-1.5 py-0.5 ${winner && winner !== match.away_team ? 'opacity-35' : ''}`}>
        <FlagImg code={match.away_team_code} />
        <span className={`text-[11px] flex-1 truncate ${winner === match.away_team ? 'text-[#FFD700] font-bold' : 'text-white font-medium'}`}>{match.away_team}</span>
        {(isFinished||isLive) && <span className={`text-[11px] font-bold ${winner === match.away_team ? 'text-[#FFD700]' : 'text-gray-400'}`}>{match.away_score??0}</span>}
      </div>
    </div>
  )
}

function MobileStage({ title, matches, color }: { title: string; matches: (Match|null)[]; color: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl overflow-hidden mb-3">
      <button onClick={() => setOpen(o=>!o)} className="w-full flex items-center justify-between px-4 py-3">
        <span className={`font-bebas text-lg tracking-wider ${color}`}>{title}</span>
        <span className="text-gray-500 text-xs">{open?'▲':'▼'}</span>
      </button>
      {open && <div className="px-3 pb-3 grid grid-cols-1 gap-2 border-t border-[#2A2A4A]">{matches.map((m,i)=><div key={i} className="mt-2"><MatchCard match={m} /></div>)}</div>}
    </div>
  )
}

const CW = 150; const CH = 52; const CG = 32; const COL = CW + CG

export default function BracketPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    createClient().from('matches').select('*').neq('stage','Group Stage').order('match_date',{ascending:true}).then(({data})=>{setMatches(data||[]);setLoading(false)})
  }, [])
  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-[#FFD700]" /></div>
  const pad = (arr: Match[], n: number): (Match|null)[] => { const r: (Match|null)[] = [...arr]; while(r.length<n) r.push(null); return r }
  const octavos = pad(matches.filter(m=>m.stage==='Octavos de Final'),8)
  const cuartos = pad(matches.filter(m=>m.stage==='Cuartos de Final'),4)
  const semis = pad(matches.filter(m=>m.stage==='Semifinal'),2)
  const tercero = pad(matches.filter(m=>m.stage==='Tercer Puesto'),1)
  const final = pad(matches.filter(m=>m.stage==='Final'),1)
  const TW = 7*COL+CW; const TH = 880
  const oY = (i: number) => 80+i*(CH+14)
  const qY = (i: number) => 80+i*(CH*2+28)+CH/2+7
  const sY = (i: number) => 80+i*(CH*4+56)+CH+21
  const fY = TH/2-CH/2-20
  const tY = TH/2+CH+20
  const cx = (i: number) => i*COL
  const lc = '#FFD700'; const dc = '#FFD70066'
  return (
    <div className="px-4 py-6 max-w-full mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors mb-5"><ArrowLeft size={16}/>Volver</Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#FFD700]/20 flex items-center justify-center"><Trophy size={20} className="text-[#FFD700]" /></div>
        <div><h1 className="font-bebas text-3xl text-white tracking-wider leading-none">CUADRO ELIMINATORIO</h1><p className="text-xs text-[#86EFAC] font-semibold">FIFA World Cup 2026™</p></div>
        <Link href="/grupos" className="ml-auto flex items-center gap-2 bg-[#1A1A2E] border border-[#2A2A4A] text-gray-300 font-bold px-3 py-2 rounded-xl text-xs hover:border-[#FFD700]/50 hover:text-white transition-all"><Users size={14}/>Grupos</Link>
      </div>
      <div className="hidden md:block overflow-x-auto pb-6">
        <div className="relative" style={{width:TW,height:TH}}>
          {[{l:'OCTAVOS',x:cx(0)},{l:'CUARTOS',x:cx(1)},{l:'SEMI',x:cx(2)},{l:'SEMI',x:cx(4)},{l:'CUARTOS',x:cx(5)},{l:'OCTAVOS',x:cx(6)}].map(({l,x})=>(
            <div key={x} className="absolute font-bebas text-base tracking-wider text-center text-[#FFD700]" style={{left:x,top:56,width:CW}}>{l}</div>
          ))}
          <div className="absolute font-bebas text-2xl tracking-wider text-center text-[#FFD700]" style={{left:cx(3)-20,top:48,width:CW+40}}>🏆 GRAN FINAL</div>
          <div className="absolute font-bebas text-xs tracking-wider text-center text-gray-500" style={{left:cx(3),top:tY-16,width:CW}}>3° PUESTO</div>
          <svg className="absolute inset-0 pointer-events-none" width={TW} height={TH} style={{overflow:'visible'}}>
            {octavos.slice(0,4).map((_,i)=>{ const pair=Math.floor(i/2); const x1=cx(0)+CW,y1=oY(i)+CH/2,x2=cx(1),y2=qY(pair); return <path key={`ol${i}`} d={`M${x1} ${y1}H${(x1+x2)/2}V${y2}H${x2}`} stroke={lc} strokeWidth="1" opacity="0.4" fill="none"/> })}
            {octavos.slice(4,8).map((_,i)=>{ const pair=Math.floor(i/2); const x1=cx(6),y1=oY(i)+CH/2,x2=cx(5)+CW,y2=qY(pair+2); return <path key={`or${i}`} d={`M${x1} ${y1}H${(x1+x2)/2}V${y2}H${x2}`} stroke={lc} strokeWidth="1" opacity="0.4" fill="none"/> })}
            {[0,1].map(i=>{ const x1=cx(1)+CW,y1=qY(i),x2=cx(2),y2=sY(0); return <path key={`cl${i}`} d={`M${x1} ${y1}H${(x1+x2)/2}V${y2}H${x2}`} stroke={lc} strokeWidth="1" opacity="0.4" fill="none"/> })}
            {[0,1].map(i=>{ const x1=cx(5),y1=qY(i+2),x2=cx(4)+CW,y2=sY(1); return <path key={`cr${i}`} d={`M${x1} ${y1}H${(x1+x2)/2}V${y2}H${x2}`} stroke={lc} strokeWidth="1" opacity="0.4" fill="none"/> })}
            <path d={`M${cx(2)+CW} ${sY(0)}H${(cx(2)+CW+cx(3))/2}V${fY+CH/2}H${cx(3)}`} stroke={lc} strokeWidth="1" opacity="0.4" fill="none"/>
            <path d={`M${cx(4)} ${sY(1)}H${(cx(4)+cx(3)+CW)/2}V${fY+CH/2}H${cx(3)+CW}`} stroke={lc} strokeWidth="1" opacity="0.4" fill="none"/>
            <path d={`M${cx(2)+CW} ${sY(0)}H${cx(2)+CW+18}V${tY+CH/2}H${cx(3)}`} stroke={dc} strokeWidth="1" opacity="0.3" strokeDasharray="5 3" fill="none"/>
            <path d={`M${cx(4)} ${sY(1)}H${cx(4)-18}V${tY+CH/2}H${cx(3)+CW}`} stroke={dc} strokeWidth="1" opacity="0.3" strokeDasharray="5 3" fill="none"/>
          </svg>
          {octavos.slice(0,4).map((m,i)=><div key={i} className="absolute" style={{left:cx(0),top:oY(i),width:CW}}><MatchCard match={m}/></div>)}
          {cuartos.slice(0,2).map((m,i)=><div key={i} className="absolute" style={{left:cx(1),top:qY(i)-CH/2,width:CW}}><MatchCard match={m}/></div>)}
          <div className="absolute" style={{left:cx(2),top:sY(0)-CH/2,width:CW}}><MatchCard match={semis[0]}/></div>
          <div className="absolute" style={{left:cx(3),top:fY,width:CW}}><MatchCard match={final[0]} highlight/></div>
          <div className="absolute" style={{left:cx(3),top:tY,width:CW}}><MatchCard match={tercero[0]}/></div>
          <div className="absolute" style={{left:cx(4),top:sY(1)-CH/2,width:CW}}><MatchCard match={semis[1]}/></div>
          {cuartos.slice(2,4).map((m,i)=><div key={i} className="absolute" style={{left:cx(5),top:qY(i+2)-CH/2,width:CW}}><MatchCard match={m}/></div>)}
          {octavos.slice(4,8).map((m,i)=><div key={i} className="absolute" style={{left:cx(6),top:oY(i),width:CW}}><MatchCard match={m}/></div>)}
        </div>
      </div>
      <div className="md:hidden">
        <MobileStage title="OCTAVOS DE FINAL" matches={octavos} color="text-[#A855F7]"/>
        <MobileStage title="CUARTOS DE FINAL" matches={cuartos} color="text-[#A855F7]"/>
        <MobileStage title="SEMIFINAL" matches={semis} color="text-[#A855F7]"/>
        <MobileStage title="TERCER PUESTO" matches={tercero} color="text-gray-400"/>
        <MobileStage title="🏆 GRAN FINAL" matches={final} color="text-[#FFD700]"/>
      </div>
    </div>
  )
}
