'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, GitBranch } from 'lucide-react'
import Link from 'next/link'

type Match = {
  id: string; home_team: string; away_team: string; home_team_code: string; away_team_code: string
  home_score: number | null; away_score: number | null; status: string; match_date: string; stage: string; group_name: string | null
}
type TeamStats = { name: string; code: string; pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; dif: number; pts: number }

function FlagImg({ code, size = 20 }: { code: string; size?: number }) {
  return <img src={`https://flagcdn.com/40x30/${(code||'un').toLowerCase()}.png`} alt={code} width={size} height={Math.round(size*0.75)} className="rounded-sm object-cover flex-shrink-0" />
}
function formatDate(d: string) { return new Date(d).toLocaleDateString('es-ES',{day:'numeric',month:'short',timeZone:'America/New_York'}) }
function formatTime(d: string) { return new Date(d).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true,timeZone:'America/New_York'}) }

function buildStandings(matches: Match[]): TeamStats[] {
  const stats: Record<string,TeamStats> = {}
  const ensure = (name: string, code: string) => { if(!stats[name]) stats[name]={name,code,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,dif:0,pts:0} }
  for(const m of matches) {
    ensure(m.home_team,m.home_team_code); ensure(m.away_team,m.away_team_code)
    const isFinished = m.status==='finished'||m.status==='FT'
    if(!isFinished||m.home_score===null||m.away_score===null) continue
    const h=stats[m.home_team],a=stats[m.away_team]
    h.pj++;a.pj++;h.gf+=m.home_score;h.gc+=m.away_score;a.gf+=m.away_score;a.gc+=m.home_score
    if(m.home_score>m.away_score){h.pg++;h.pts+=3;a.pp++}
    else if(m.home_score<m.away_score){a.pg++;a.pts+=3;h.pp++}
    else{h.pe++;h.pts++;a.pe++;a.pts++}
    h.dif=h.gf-h.gc;a.dif=a.gf-a.gc
  }
  return Object.values(stats).sort((a,b)=>b.pts!==a.pts?b.pts-a.pts:b.dif!==a.dif?b.dif-a.dif:b.gf-a.gf)
}

function GroupCard({group,matches}:{group:string;matches:Match[]}) {
  const [showMatches,setShowMatches]=useState(false)
  const standings=buildStandings(matches)
  const played=matches.filter(m=>m.status==='finished'||m.status==='FT')
  return (
    <div className="bg-[#0D0D1A] border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <h2 className="font-sans text-xl text-[#00C896] tracking-wider">GRUPO {group}</h2>
        <span className="text-xs text-gray-400">{played.length}/{matches.length} jugados</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-white/10">
            <th className="text-left px-3 py-2 text-gray-500 font-semibold w-6">#</th>
            <th className="text-left px-2 py-2 text-gray-500 font-semibold">Equipo</th>
            <th className="text-center px-2 py-2 text-gray-500 font-semibold">PJ</th>
            <th className="text-center px-2 py-2 text-gray-500 font-semibold">PG</th>
            <th className="text-center px-2 py-2 text-gray-500 font-semibold">PE</th>
            <th className="text-center px-2 py-2 text-gray-500 font-semibold">PP</th>
            <th className="text-center px-2 py-2 text-gray-500 font-semibold">GF</th>
            <th className="text-center px-2 py-2 text-gray-500 font-semibold">GC</th>
            <th className="text-center px-2 py-2 text-gray-500 font-semibold">DIF</th>
            <th className="text-center px-2 py-2 text-[#00C896] font-bold">PTS</th>
          </tr></thead>
          <tbody>
            {standings.map((team,i)=>(
              <tr key={team.name} className={`border-b border-white/10/50 ${i<2?'bg-[#22C55E]/5':''}`}>
                <td className="px-3 py-2.5"><span className={`font-bold ${i<2?'text-[#22C55E]':'text-gray-500'}`}>{i+1}</span></td>
                <td className="px-2 py-2.5"><div className="flex items-center gap-2"><FlagImg code={team.code} size={16}/><span className={`font-semibold truncate max-w-[100px] ${i<2?'text-white':'text-gray-300'}`}>{team.name}</span></div></td>
                <td className="text-center px-2 py-2.5 text-gray-400">{team.pj}</td>
                <td className="text-center px-2 py-2.5 text-gray-400">{team.pg}</td>
                <td className="text-center px-2 py-2.5 text-gray-400">{team.pe}</td>
                <td className="text-center px-2 py-2.5 text-gray-400">{team.pp}</td>
                <td className="text-center px-2 py-2.5 text-gray-400">{team.gf}</td>
                <td className="text-center px-2 py-2.5 text-gray-400">{team.gc}</td>
                <td className={`text-center px-2 py-2.5 font-semibold ${team.dif>0?'text-[#22C55E]':team.dif<0?'text-red-400':'text-gray-400'}`}>{team.dif>0?'+':''}{team.dif}</td>
                <td className="text-center px-2 py-2.5 font-bold text-[#00C896]">{team.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={()=>setShowMatches(o=>!o)} className="w-full px-4 py-2.5 text-xs text-gray-400 hover:text-white border-t border-white/10 transition-colors flex items-center justify-center gap-1">
        {showMatches?'▲ Ocultar matches':'▼ Ver matches del grupo'}
      </button>
      {showMatches&&(
        <div className="px-3 pb-3 space-y-2 border-t border-white/10">
          {matches.map(m=>{
            const isFinished=m.status==='finished'||m.status==='FT'
            const isLive=m.status==='live'||m.status==='1H'||m.status==='2H'||m.status==='HT'
            return(
              <div key={m.id} className="flex items-center gap-2 bg-[#080812] rounded-xl px-3 py-2 mt-2">
                <div className="flex items-center gap-1.5 flex-1 justify-end">
                  <span className="text-xs font-semibold text-white text-right truncate">{m.home_team}</span>
                  <FlagImg code={m.home_team_code} size={16}/>
                </div>
                <div className="min-w-[52px] text-center">
                  {isLive?(<span className="flex items-center justify-center gap-1 text-[#22C55E] font-bold text-sm"><span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"/>{m.home_score}-{m.away_score}</span>)
                  :isFinished?(<span className="font-bold text-sm text-white">{m.home_score}-{m.away_score}</span>)
                  :(<div className="text-center"><div className="text-[10px] text-[#00C896] font-bold">{formatTime(m.match_date)}</div><div className="text-[10px] text-gray-500">{formatDate(m.match_date)}</div></div>)}
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <FlagImg code={m.away_team_code} size={16}/>
                  <span className="text-xs font-semibold text-white truncate">{m.away_team}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function GruposPage() {
  const [matches,setMatches]=useState<Match[]>([])
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    const supabase=createClient()
    supabase.from('matches').select('*').eq('stage','Group Stage').order('match_date',{ascending:true}).then(({data})=>{setMatches(data||[]);setLoading(false)})
  },[])
  if(loading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-[#00C896]"/></div>
  const byGroup: Record<string,Match[]>={}
  for(const m of matches){const g=m.group_name||'X';if(!byGroup[g])byGroup[g]=[];byGroup[g].push(m)}
  const groups=Object.keys(byGroup).sort()
  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-base font-bold text-white hover:text-[#00C896] transition-colors mb-4"><ArrowLeft size={20}/>Back</Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-sans text-4xl text-white tracking-wider leading-none">FASE DE GRUPOS</h1>
          <p className="text-sm text-[#86EFAC] font-semibold">FIFA World Cup 2026™</p>
        </div>
        <Link href="/bracket" className="flex items-center gap-2 bg-[#A855F7]/20 border border-[#A855F7]/30 text-[#A855F7] font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#A855F7]/30 transition-all">
          <GitBranch size={16}/>Eliminatorias →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map(group=><GroupCard key={group} group={group} matches={byGroup[group]}/>)}
      </div>
    </div>
  )
}
