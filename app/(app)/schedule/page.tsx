'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart2, X, Send, Loader2, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type ViewMode = 'grupo' | 'dia' | 'ciudad'

const TEAM_NAMES_EN: Record<string, string> = {
  'Argentina': 'Argentina', 'Brasil': 'Brazil', 'Colombia': 'Colombia',
  'Uruguay': 'Uruguay', 'México': 'Mexico', 'Estados Unidos': 'United States',
  'España': 'Spain', 'Francia': 'France', 'Portugal': 'Portugal',
  'Alemania': 'Germany', 'Inglaterra': 'England', 'Marruecos': 'Morocco',
  'Senegal': 'Senegal', 'Japón': 'Japan', 'Corea del Sur': 'South Korea',
  'Países Bajos': 'Netherlands', 'Ecuador': 'Ecuador', 'Canadá': 'Canada',
  'Paraguay': 'Paraguay', 'Venezuela': 'Venezuela', 'Bolivia': 'Bolivia',
  'Perú': 'Peru', 'Chile': 'Chile', 'Costa Rica': 'Costa Rica',
  'Panamá': 'Panama', 'Arabia Saudita': 'Saudi Arabia', 'Australia': 'Australia',
  'Irán': 'Iran', 'Qatar': 'Qatar', 'Croacia': 'Croatia', 'Serbia': 'Serbia',
  'Suiza': 'Switzerland', 'Ghana': 'Ghana', 'Nigeria': 'Nigeria',
  'Egipto': 'Egypt', 'Nueva Zelanda': 'New Zealand', 'Bélgica': 'Belgium',
  'Polonia': 'Poland', 'Turquía': 'Turkey', 'República Checa': 'Czech Republic',
  'Escocia': 'Scotland', 'Ucrania': 'Ukraine', 'Rumania': 'Romania',
  'Hungría': 'Hungary', 'Eslovenia': 'Slovenia', 'Bosnia y Herzegovina': 'Bosnia & Herzegovina',
  'Albania': 'Albania', 'Georgia': 'Georgia', 'Sudáfrica': 'South Africa',
  'Camerún': 'Cameroon', 'Mali': 'Mali', 'Costa de Marfil': "Ivory Coast",
  'Túnez': 'Tunisia', 'Argelia': 'Algeria', 'Congo': 'Congo',
  'Zambia': 'Zambia', 'Zimbabue': 'Zimbabwe', 'Tanzania': 'Tanzania',
  'Indonesia': 'Indonesia', 'Vietnam': 'Vietnam', 'Tailandia': 'Thailand',
  'China': 'China', 'Irak': 'Iraq', 'Siria': 'Syria', 'Jordania': 'Jordan',
  'Kuwait': 'Kuwait', 'Bahréin': 'Bahrain', 'Omán': 'Oman',
  'República Dominicana': 'Dominican Republic', 'Cuba': 'Cuba',
  'Guatemala': 'Guatemala', 'Honduras': 'Honduras', 'Jamaica': 'Jamaica',
  'Trinidad y Tobago': 'Trinidad & Tobago', 'Haití': 'Haiti',
}

function translateTeam(name: string, locale: string): string {
  if (locale !== 'en') return name
  return TEAM_NAMES_EN[name] || name
}

function FlagImg({ code, size = 28 }: { code: string; size?: number }) {
  return (
    <img
      src={`https://flagcdn.com/40x30/${(code || 'un').toLowerCase()}.png`}
      alt={code} width={size} height={Math.round(size * 0.75)}
      className="rounded-sm object-cover"
    />
  )
}

function formatTimes(dateStr: string) {
  const date = new Date(dateStr)
  const fmt24 = (tz: string) => date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: tz })
  const fmt12 = (tz: string) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz })
  return {
    ar: fmt24('America/Argentina/Buenos_Aires'),
    co: fmt24('America/Bogota'),
    et: fmt12('America/New_York'),
    ct: fmt12('America/Chicago'),
    pt: fmt12('America/Los_Angeles'),
  }
}

function formatDay(dateStr: string, locale = 'es') {
  return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/New_York'
  })
}

type Match = {
  id: string; home_team: string; away_team: string; home_team_code: string; away_team_code: string
  home_score: number | null; away_score: number | null; status: string; match_date: string
  venue: string; city: string; stage: string; group_name: string | null
}

type ChatMessage = { role: 'user' | 'assistant'; content: string }

function StatsPanel({ homeTeam, awayTeam, homeTeamCode, awayTeamCode, onClose }: {
  homeTeam: string; awayTeam: string; homeTeamCode: string; awayTeamCode: string; onClose: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState('')
  const [chatMode, setChatMode] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [teamInfo, setTeamInfo] = useState('')
  const [teamLoading, setTeamLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [question, setQuestion] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [questionsLeft, setQuestionsLeft] = useState(3)

  useEffect(() => {
    fetch('/api/game/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'stats', homeTeam, awayTeam }),
    }).then(r => r.json()).then(d => { setStats(d.answer); setLoading(false) })
  }, [homeTeam, awayTeam])

  async function handleTeamSelect(team: string) {
    setSelectedTeam(team)
    setTeamLoading(true)
    setMessages([])
    setQuestionsLeft(3)
    const res = await fetch('/api/game/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'team', team }),
    })
    const d = await res.json()
    setTeamInfo(d.answer)
    setTeamLoading(false)
    setChatMode(true)
  }

  async function handleChat() {
    if (!question.trim() || questionsLeft === 0 || chatLoading) return
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: question }]
    setMessages(newMessages)
    setQuestion('')
    setChatLoading(true)
    setQuestionsLeft(q => q - 1)
    const res = await fetch('/api/game/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'chat', team: selectedTeam, question, history: messages }),
    })
    const d = await res.json()
    setMessages([...newMessages, { role: 'assistant', content: d.answer }])
    setChatLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-[#1A1A2E] w-full md:max-w-lg md:rounded-2xl rounded-t-2xl border border-[#2A2A4A] max-h-[90dvh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#2A2A4A] shrink-0">
          <div className="flex items-center gap-2">
            <FlagImg code={homeTeamCode} size={24} />
            <span className="font-bebas text-xl text-white tracking-wider">{homeTeam} vs {awayTeam}</span>
            <FlagImg code={awayTeamCode} size={24} />
          </div>
          <button onClick={onClose} className="text-white hover:text-[#FFD700]"><X size={22} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-white">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-base">Analizando el partido...</span>
            </div>
          ) : (
            <div className="text-base text-white leading-relaxed whitespace-pre-wrap mb-4">{stats}</div>
          )}
          {!loading && !chatMode && (
            <div className="border-t border-[#2A2A4A] pt-4">
              <p className="text-base font-bold text-white mb-3">¿Querés saber más de algún equipo?</p>
              <div className="flex gap-3 mb-4">
                <button onClick={() => handleTeamSelect(homeTeam)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0D0D0D] border border-[#2A2A4A] hover:border-[#FFD700] rounded-xl px-3 py-3 text-base font-bold text-white transition-all">
                  <FlagImg code={homeTeamCode} size={24} />{homeTeam}
                </button>
                <button onClick={() => handleTeamSelect(awayTeam)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0D0D0D] border border-[#2A2A4A] hover:border-[#FFD700] rounded-xl px-3 py-3 text-base font-bold text-white transition-all">
                  <FlagImg code={awayTeamCode} size={24} />{awayTeam}
                </button>
              </div>
            </div>
          )}
          {chatMode && (
            <div className="border-t border-[#2A2A4A] pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-base font-bold text-[#FFD700]">{selectedTeam}</p>
                <span className="text-sm text-white font-semibold">{questionsLeft} preguntas restantes</span>
              </div>
              {teamLoading ? (
                <div className="flex items-center gap-2 text-white text-base py-4">
                  <Loader2 size={16} className="animate-spin" />Cargando...
                </div>
              ) : (
                <div className="text-base text-white leading-relaxed whitespace-pre-wrap mb-4">{teamInfo}</div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`mb-3 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-[85%] px-3 py-2 rounded-xl text-base ${
                    m.role === 'user' ? 'bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20' : 'bg-[#0D0D0D] text-white border border-[#2A2A4A]'
                  }`}>{m.content}</div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-center gap-2 text-white text-base mb-3">
                  <Loader2 size={14} className="animate-spin" />Pensando...
                </div>
              )}
            </div>
          )}
        </div>
        {chatMode && questionsLeft > 0 && (
          <div className="p-4 border-t border-[#2A2A4A] shrink-0">
            <div className="flex gap-2">
              <input value={question} onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChat()}
                placeholder={`Preguntá sobre ${selectedTeam}...`}
                className="flex-1 bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-3 text-base text-white focus:outline-none focus:border-[#FFD700]"
              />
              <button onClick={handleChat} disabled={chatLoading || !question.trim()}
                className="bg-[#FFD700] text-black rounded-xl px-4 py-3 disabled:opacity-50">
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
        {chatMode && questionsLeft === 0 && (
          <div className="px-4 py-3 border-t border-[#2A2A4A] text-center text-base text-white shrink-0">
            Límite de 3 preguntas alcanzado.
          </div>
        )}
      </div>
    </div>
  )
}

function MatchCard({ match, locale = 'es' }: { match: Match; locale?: string }) {
  const times = formatTimes(match.match_date)
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'
  const [showStats, setShowStats] = useState(false)

  return (
    <>
      <div className="bg-[#0D0D0D] rounded-xl p-4 mb-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
          <span className="text-base font-bold text-white">🇦🇷 {times.ar}</span>
          <span className="text-base font-bold text-white">🇨🇴 {times.co}</span>
          <span className="text-base font-bold text-[#FFD700]">🇺🇸 ET {times.et}</span>
          <span className="text-base font-bold text-white">🇺🇸 CT {times.ct}</span>
          <span className="text-base font-bold text-white">🇺🇸 PT {times.pt}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <FlagImg code={match.home_team_code} size={38} />
            <span className="text-xl font-bold text-white">{translateTeam(match.home_team, locale)}</span>
          </div>
          <div className="px-3 py-1 bg-[#1A1A2E] rounded-lg mx-2 shrink-0 min-w-[64px] text-center">
            {isLive ? (
              <span className="flex items-center justify-center gap-1 text-[#22C55E] font-bebas text-xl">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                {match.home_score ?? 0}-{match.away_score ?? 0}
              </span>
            ) : isFinished ? (
              <span className="font-bebas text-xl text-white">{match.home_score ?? 0}-{match.away_score ?? 0}</span>
            ) : (
              <span className="text-white text-base font-bold">vs</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-xl font-bold text-white text-right">{translateTeam(match.away_team, locale)}</span>
            <FlagImg code={match.away_team_code} size={38} />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#22C55E]">📍 {match.venue} — {match.city}</span>
          <button onClick={() => setShowStats(true)}
            className="flex items-center gap-1 text-base font-bold text-[#FFD700] hover:text-[#FFD700]/80 transition-colors">
            <BarChart2 size={16} />Stats
          </button>
        </div>
      </div>
      {showStats && <StatsPanel homeTeam={match.home_team} awayTeam={match.away_team} homeTeamCode={match.home_team_code} awayTeamCode={match.away_team_code} onClose={() => setShowStats(false)} />}
    </>
  )
}

function SectionWrapper({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="mb-6 bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 border-b border-[#2A2A4A]">
        <h2 className={`font-bebas text-2xl tracking-wider ${color}`}>{title}</h2>
        {open ? <ChevronUp size={20} className={color} /> : <ChevronDown size={20} className={color} />}
      </button>
      {open && <div className="p-3">{children}</div>}
    </div>
  )
}

function DayLabel({ day }: { day: string }) {
  return <p className="text-base font-bold text-white uppercase tracking-wider mb-3 mt-1 capitalize">{day}</p>
}

const stageLabels: Record<string, string> = {
  'Octavos de Final': 'Octavos de Final',
  'Cuartos de Final': 'Cuartos de Final',
  'Semifinal': 'Semifinal',
  'Tercer Puesto': 'Tercer Puesto',
  'Final': 'Gran Final 🏆',
}

export default function FixturePage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('grupo')
  const [locale, setLocale] = useState('es')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const match = document.cookie.match(/locale=([^;]+)/)
    if (match) setLocale(match[1])
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('matches').select('*').order('match_date', { ascending: true }).then(({ data }) => {
      setMatches(data || [])
      setLoading(false)
    })
  }, [])

  function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
    const result: Record<string, T[]> = {}
    for (const item of arr) {
      const k = key(item)
      if (!result[k]) result[k] = []
      result[k].push(item)
    }
    return result
  }

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-[#FFD700]" />
    </div>
  )

  const groupMatches = matches.filter(m => m.stage === 'Group Stage')
  const knockoutMatches = matches.filter(m => m.stage !== 'Group Stage')
  const stageOrder = ['Octavos de Final', 'Cuartos de Final', 'Semifinal', 'Tercer Puesto', 'Final']
  const btnBase = 'px-4 py-2 rounded-xl text-base font-bold transition-all'
  const btnActive = 'bg-[#FFD700] text-black'
  const btnInactive = 'bg-[#1A1A2E] text-white border border-[#2A2A4A] hover:border-[#FFD700]'

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto md:max-w-4xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-base font-bold text-white hover:text-[#FFD700] transition-colors mb-4">
        <ArrowLeft size={20} />Volver
      </Link>
      <h1 className="font-bebas text-5xl text-white tracking-wider mb-1">FIXTURE</h1>
      <p className="text-sm font-semibold text-[#86EFAC] mb-5">Horarios ARG 🇦🇷 · COL 🇨🇴 · ET 🇺🇸 · CT · PT</p>
      <div className="flex gap-2 mb-6">
        <button className={`${btnBase} ${view === 'grupo' ? btnActive : btnInactive}`} onClick={() => setView('grupo')}>Por Grupo</button>
        <button className={`${btnBase} ${view === 'dia' ? btnActive : btnInactive}`} onClick={() => setView('dia')}>Por Día</button>
        <button className={`${btnBase} ${view === 'ciudad' ? btnActive : btnInactive}`} onClick={() => setView('ciudad')}>Por Ciudad</button>
      </div>

      {view === 'grupo' && (
        <>
          {Object.entries(groupBy(groupMatches, m => m.group_name || 'X')).sort(([a], [b]) => a.localeCompare(b)).map(([group, ms]) => (
            <SectionWrapper key={group} title={`Grupo ${group}`} color="text-[#FFD700]">
              {Object.entries(groupBy(ms, m => formatDay(m.match_date, locale))).map(([day, dms]) => (
                <div key={day}><DayLabel day={day} />{dms.map(m => <MatchCard key={m.id} match={m} locale={locale} />)}</div>
              ))}
            </SectionWrapper>
          ))}
          {stageOrder.map(stage => {
            const ms = knockoutMatches.filter(m => m.stage === stage)
            if (!ms.length) return null
            return (
              <SectionWrapper key={stage} title={stageLabels[stage] || stage} color="text-[#A855F7]">
                {Object.entries(groupBy(ms, m => formatDay(m.match_date, locale))).map(([day, dms]) => (
                  <div key={day}><DayLabel day={day} />{dms.map(m => <MatchCard key={m.id} match={m} locale={locale} />)}</div>
                ))}
              </SectionWrapper>
            )
          })}
        </>
      )}

      {view === 'dia' && (
        <>
          {Object.entries(groupBy(matches, m => formatDay(m.match_date, locale))).map(([day, ms]) => (
            <SectionWrapper key={day} title={day} color="text-[#FFD700]">
              {ms.map(m => <MatchCard key={m.id} match={m} locale={locale} />)}
            </SectionWrapper>
          ))}
        </>
      )}

      {view === 'ciudad' && (
        <>
          {Object.entries(groupBy(matches, m => m.city || 'Sin ciudad')).sort(([a], [b]) => a.localeCompare(b)).map(([city, ms]) => (
            <SectionWrapper key={city} title={city} color="text-[#22C55E]">
              {Object.entries(groupBy(ms, m => formatDay(m.match_date, locale))).map(([day, dms]) => (
                <div key={day}><DayLabel day={day} />{dms.map(m => <MatchCard key={m.id} match={m} locale={locale} />)}</div>
              ))}
            </SectionWrapper>
          ))}
        </>
      )}

      {matches.length === 0 && (
        <div className="text-center py-12 text-white text-lg">No hay partidos cargados aún.</div>
      )}
    </div>
  )
}
