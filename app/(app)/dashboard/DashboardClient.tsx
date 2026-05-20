'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import NewsSection from './NewsSection'
import Link from 'next/link'
import { Zap, Calendar, Sparkles, Users, MessageCircle, Trophy, BarChart2, BookOpen } from 'lucide-react'

const ARG_MATCHES = [
  '2026-06-13T02:00:00Z','2026-06-22T22:00:00Z','2026-06-27T23:00:00Z',
  '2026-07-01T00:00:00Z','2026-07-05T00:00:00Z','2026-07-09T00:00:00Z',
  '2026-07-14T22:00:00Z','2026-07-19T20:00:00Z',
]
const COL_MATCHES = [
  '2026-06-18T03:00:00Z','2026-06-23T03:00:00Z','2026-06-28T03:00:00Z',
  '2026-07-01T00:00:00Z','2026-07-05T00:00:00Z','2026-07-09T00:00:00Z',
  '2026-07-15T00:00:00Z','2026-07-19T20:00:00Z',
]

function getNextDate(dates: string[]): string {
  const now = Date.now()
  const future = dates.map(d => new Date(d).getTime()).filter(t => t > now).sort((a,b)=>a-b)
  return future.length > 0 ? new Date(future[0]).toISOString() : dates[dates.length-1]
}

function useCountdown(targetDate: string) {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) { setT({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return }
      setT({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return t
}

function BigClock({ targetDate }: { targetDate: string }) {
  const t = useCountdown(targetDate)
  return (
    <div className="flex items-center justify-center gap-2">
      {[{v:t.days,l:'DÍAS'},{v:t.hours,l:'HRS'},{v:t.minutes,l:'MIN'},{v:t.seconds,l:'SEG'}].map(({v,l},i)=>(
        <div key={l} className="flex items-center gap-2">
          {i > 0 && <span className="font-bebas text-3xl text-[#FFD700]">:</span>}
          <div className="flex flex-col items-center">
            <div className="bg-[#0D0D0D] border-2 border-[#FFD700]/50 rounded-xl px-3 py-2 min-w-[60px] text-center">
              <span className="font-bebas text-5xl text-[#FFD700] leading-none">{String(v).padStart(2,'0')}</span>
            </div>
            <span className="text-[10px] font-bold text-white mt-0.5">{l}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function SmallClock({ targetDate, color }: { targetDate: string; color: string }) {
  const t = useCountdown(targetDate)
  return (
    <div className="flex items-center gap-0.5">
      {[{v:t.days,l:'D'},{v:t.hours,l:'H'},{v:t.minutes,l:'M'},{v:t.seconds,l:'S'}].map(({v,l},i)=>(
        <div key={l} className="flex items-center gap-0.5">
          {i > 0 && <span className={`font-bebas text-4xl ${color}`}>:</span>}
          <div className="flex flex-col items-center">
            <div className="bg-black/40 rounded px-1.5 min-w-[44px] text-center">
              <span className={`font-bebas text-5xl ${color} leading-none`}>{String(v).padStart(2,'0')}</span>
            </div>
            <span className={`text-[9px] font-bold ${color} opacity-80`}>{l}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function JSTicker({ items, fast = false, bgLabel, label }: {
  items: React.ReactNode[]; fast?: boolean; bgLabel: string; label: string
}) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-2xl border border-[#2A2A4A] mb-3" style={{height:'52px'}}>
      <div className={`shrink-0 ${bgLabel} px-3 flex items-center gap-1.5 z-10`}>
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span className="font-bebas text-white text-base tracking-wider whitespace-nowrap">{label}</span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className={fast ? 'ticker-run-fast' : 'ticker-run'}>
          <div className="flex items-center">{items}</div>
          <div className="flex items-center">{items}</div>
        </div>
      </div>
    </div>
  )
}

function NavBtn({ href, icon: Icon, label, iconColor, glow }: {
  href: string; icon: any; label: string; iconColor: string; glow: string
}) {
  const [h, setH] = useState(false)
  return (
    <Link href={href}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      className="flex flex-col items-center gap-1 rounded-xl py-4 border-2 transition-all duration-200"
      style={{
        background: h ? `radial-gradient(circle, ${glow}30, #1A1A2E)` : '#1A1A2E',
        borderColor: h ? glow : '#2A2A4A',
        boxShadow: h ? `0 0 20px ${glow}, 0 0 40px ${glow}60` : 'none',
        transform: h ? 'scale(1.08)' : 'scale(1)',
      }}>
      <Icon size={24} className={iconColor} />
      <span className={`text-sm font-bold ${iconColor}`}>{label}</span>
    </Link>
  )
}

const teamFlags: Record<string,string> = {
  'Argentina':'ar','Brasil':'br','Colombia':'co','Uruguay':'uy','México':'mx',
  'Estados Unidos':'us','España':'es','Francia':'fr','Portugal':'pt','Alemania':'de',
  'Inglaterra':'gb-eng','Marruecos':'ma','Senegal':'sn','Japón':'jp','Corea del Sur':'kr',
  'Países Bajos':'nl','Ecuador':'ec','Canadá':'ca','Paraguay':'py','Venezuela':'ve',
  'Bolivia':'bo','Perú':'pe','Chile':'cl','Costa Rica':'cr','Panamá':'pa',
  'Arabia Saudita':'sa','Australia':'au','Irán':'ir','Qatar':'qa','Croacia':'hr',
  'Serbia':'rs','Suiza':'ch','Ghana':'gh','Nigeria':'ng','Egipto':'eg','Nueva Zelanda':'nz',
}

export default function DashboardClient({ profile, matches, onlineCount, openBattles }: {
  profile: any; matches: any[]; onlineCount: number; openBattles: any[]
}) {
  const t = useTranslations('dashboard')
  const teamCode = teamFlags[profile?.favorite_team] || 'un'

  function formatTime(d: string) {
    return new Date(d).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit',timeZone:'America/New_York'})
  }
  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('es-ES',{weekday:'short',day:'numeric',month:'short',timeZone:'America/New_York'})
  }

  const battleItems = openBattles.length > 0
    ? openBattles.map((b: any, i) => (
        <span key={i} className="text-base font-bold text-[#FFD700] whitespace-nowrap px-6">
          ⚡ @{b.profiles?.username || '?'} puso ${b.bet_amount} — {b.title} — {b.description} — ¿Quién se suma?
          <span className="mx-4 text-[#FFD700]/40">★</span>
        </span>
      ))
    : [<span key="0" className="text-base font-bold text-[#FFD700] whitespace-nowrap px-6">⚡ ⚡ No open battles — Be the first!</span>]

  const matchItems = matches.map((m, i) => (
    <span key={i} className="flex items-center gap-2 text-base font-bold text-white whitespace-nowrap px-5">
      <img src={`https://flagcdn.com/40x30/${(m.home_team_code||'un').toLowerCase()}.png`} width={24} height={18} className="rounded-sm" alt="" />
      {m.home_team}
      <span className="text-[#FFD700]">vs</span>
      {m.away_team}
      <img src={`https://flagcdn.com/40x30/${(m.away_team_code||'un').toLowerCase()}.png`} width={24} height={18} className="rounded-sm" alt="" />
      <span className="text-[#86EFAC] text-sm">{formatDate(m.match_date)} · {formatTime(m.match_date)} ET</span>
      <span className="text-[#2A2A4A] mx-2">|</span>
    </span>
  ))

  return (
    <div className="w-full pb-24 md:pb-6">

      {/* HERO */}
      <div className="relative w-full bg-[#0D0D0D] mb-4" style={{aspectRatio:'1200/400'}}>
        <img src="/che-bacano_logo_.png" alt="Che-Bacano"
          className="w-full h-full object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
      </div>

      <div className="px-4 md:px-6 py-2">

        {/* FILA SUPERIOR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">

          {/* Reloj Mundial */}
          <div className="bg-[#1A1A2E] border border-[#FFD700]/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-3">
            <p className="font-bebas text-base text-[#FFD700] tracking-widest text-center">{t('nextWorldCup')}</p>
            <BigClock targetDate="2026-06-11T20:00:00Z" />
          </div>

          {/* ARG + COL */}
          <div className="flex flex-col gap-3">
            <div className="bg-[#0D1B2E] border border-[#74C0FC]/40 rounded-xl p-3 flex items-center justify-between flex-1">
              <div className="flex items-center gap-2">
                <img src="https://flagcdn.com/40x30/ar.png" alt="ARG" width={40} height={30} className="rounded-sm" />
                <div>
                  <p className="text-sm font-bold text-white">Argentina</p>
                  <p className="text-[10px] text-[#74C0FC]">Próximo partido</p>
                </div>
              </div>
              <SmallClock targetDate={getNextDate(ARG_MATCHES)} color="text-[#74C0FC]" />
            </div>
            <div className="bg-[#1A1500] border border-[#FCD34D]/40 rounded-xl p-3 flex items-center justify-between flex-1">
              <div className="flex items-center gap-2">
                <img src="https://flagcdn.com/40x30/co.png" alt="COL" width={40} height={30} className="rounded-sm" />
                <div>
                  <p className="text-sm font-bold text-white">Colombia</p>
                  <p className="text-[10px] text-[#FCD34D]">Próximo partido</p>
                </div>
              </div>
              <SmallClock targetDate={getNextDate(COL_MATCHES)} color="text-[#FCD34D]" />
            </div>
          </div>

          {/* Usuario + Stats */}
          <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#FFD700]/40" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#FFD700]/20 border-2 border-[#FFD700]/30 flex items-center justify-center">
                    <span className="font-bebas text-3xl text-[#FFD700]">{profile?.username?.[0]?.toUpperCase()||'?'}</span>
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#22C55E] border-2 border-[#0D0D0D]" />
              </div>
              <div className="flex-1">
                <p className="font-bebas text-2xl text-white tracking-wider leading-tight">@{profile?.username||'campeon'}</p>
              </div>
              <div className="text-right">
                <p className="font-bebas text-3xl text-[#FFD700]">{profile?.credits||0}</p>
                <p className="text-xs text-white font-bold">CR</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[#2A2A4A] pt-2">
              <div className="flex items-center gap-2">
                <img src={`https://flagcdn.com/40x30/${teamCode}.png`} alt="" width={46} height={34} className="rounded-sm border border-white/20" />
                <div>
                  <p className="text-sm text-white font-bold">{profile?.favorite_team||'-'}</p>
                  <p className="text-xs text-gray-400">Mi equipo</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="font-bebas text-4xl text-orange-400">{openBattles.length}</p>
                  <p className="text-xs text-white font-bold">Batallas</p>
                </div>
                <div className="text-center">
                  <p className="font-bebas text-4xl text-[#22C55E]">{onlineCount}</p>
                  <p className="text-xs text-white font-bold">Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TICKER PARTIDOS */}
        {matchItems.length > 0 && (
          <JSTicker items={matchItems} fast={false} bgLabel="bg-blue-700" label={t('matches')} />
        )}

        {/* BOTONES NAV — 7 botones con Reglas */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          <NavBtn href="/fixture" icon={Calendar} label={t('fixture')} iconColor="text-blue-400" glow="#60A5FA" />
          <NavBtn href="/oracle" icon={Sparkles} label={t('oracle')} iconColor="text-[#A855F7]" glow="#A855F7" />
          <NavBtn href="/predictions" icon={Trophy} label={t('myPolla')} iconColor="text-[#FFD700]" glow="#FFD700" />
          <NavBtn href="/ranking" icon={BarChart2} label="Ranking" iconColor="text-[#22C55E]" glow="#22C55E" />
          <NavBtn href="/battles" icon={Zap} label={t('battle')} iconColor="text-orange-400" glow="#FB923C" />
          <NavBtn href="/locker-room" icon={MessageCircle} label={t('quilombo')} iconColor="text-[#22C55E]" glow="#22C55E" />
          <NavBtn href="/rules" icon={BookOpen} label="Reglas" iconColor="text-pink-400" glow="#F472B6" />
        </div>

        {/* BATALLAS ABIERTAS */}
        {openBattles.length > 0 && (
          <div className="mb-4 bg-[#1A1A2E] border border-[#FFD700]/20 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2A2A4A]">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-[#FFD700]" />
                <h2 className="font-bebas text-lg text-[#FFD700] tracking-wider">{t('openBattlesTitle')}</h2>
                <span className="bg-[#FFD700] text-black text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">{openBattles.length}</span>
              </div>
              <Link href="/battles" className="text-xs font-bold text-[#FFD700] hover:underline">{t('seeBattles')}</Link>
            </div>
            <div className="divide-y divide-[#2A2A4A]">
              {openBattles.slice(0,3).map((b: any) => (
                <Link href="/battles" key={b.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-[#FFD700]/5 transition-all">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{b.title}</p>
                    <p className="text-xs font-semibold text-[#86EFAC]">@{b.profiles?.username||'?'} — ${b.bet_amount} — {b.description}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-bebas text-lg text-[#FFD700]">${b.pot_total}</p>
                    <p className="text-[10px] font-bold text-white">en el pozo</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* NOTICIAS */}
        <NewsSection />

      </div>
    </div>
  )
}
