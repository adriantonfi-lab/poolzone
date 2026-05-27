'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Sparkles, Trophy, BarChart2, Zap, MessageCircle, BookOpen, DollarSign, RefreshCw } from 'lucide-react'

function useCountdown(target: string) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    function calc() {
      const diff = new Date(target).getTime() - Date.now()
      if (diff <= 0) return
      setT({ d: Math.floor(diff/86400000), h: Math.floor((diff%86400000)/3600000), m: Math.floor((diff%3600000)/60000), s: Math.floor((diff%60000)/1000) })
    }
    calc(); const id = setInterval(calc, 1000); return () => clearInterval(id)
  }, [target])
  return t
}

function ClockBox({ v, l }: { v: number; l: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-black/50 border-2 border-[#00C896]/40 rounded-xl flex items-center justify-center" style={{width:'64px',height:'64px'}}>
        <span style={{fontFamily:'monospace',fontSize:'30px',fontWeight:900,color:'#00C896',display:'block',width:'2ch',textAlign:'center',lineHeight:1}}>
          {String(v).padStart(2,'0')}
        </span>
      </div>
      <span className="text-[10px] font-bold text-white/40 mt-1 tracking-widest">{l}</span>
    </div>
  )
}

function NavBtn({ href, icon: Icon, label, color }: { href: string; icon: any; label: string; color: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1.5 rounded-xl py-3 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all">
      <Icon size={22} style={{color}} />
      <span className="text-xs font-bold text-white">{label}</span>
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

export default function DashboardClient({ profile, matches, onlineCount, registeredCount, openBattles }: {
  profile: any; matches: any[]; onlineCount: number; registeredCount: number; openBattles: any[]
}) {
  const cd = useCountdown('2026-06-11T19:00:00Z')
  const teamCode = teamFlags[profile?.favorite_team] || 'un'

  function formatTime(d: string) {
    return new Date(d).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',timeZone:'America/New_York'})
  }
  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US',{weekday:'short',day:'numeric',month:'short',timeZone:'America/New_York'})
  }

  // Heartbeat
  useEffect(() => {
    async function heartbeat() { await fetch('/api/heartbeat', { method: 'POST' }) }
    heartbeat()
    const id = setInterval(heartbeat, 30000)
    return () => clearInterval(id)
  }, [])

  // Push notifications
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    if (Notification.permission !== 'default') return
    const timer = setTimeout(async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js')
        await navigator.serviceWorker.ready
        const perm = await Notification.requestPermission()
        if (perm !== 'granted') return
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidKey) return
        const padding = '='.repeat((4 - vapidKey.length % 4) % 4)
        const base64 = (vapidKey + padding).replace(/-/g, '+').replace(/_/g, '/')
        const raw = window.atob(base64)
        const key = new Uint8Array(raw.length)
        for (let i = 0; i < raw.length; i++) key[i] = raw.charCodeAt(i)
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key.buffer })
        await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription: sub }) })
      } catch {}
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const matchTicker = matches.map((m, i) => (
    <span key={i} className="flex items-center gap-2 text-sm font-bold text-white whitespace-nowrap px-4">
      <img src={`https://flagcdn.com/40x30/${(m.home_team_code||'un').toLowerCase()}.png`} width={20} height={15} className="rounded-sm" alt="" />
      {m.home_team}
      <span className="text-[#00C896]">vs</span>
      {m.away_team}
      <img src={`https://flagcdn.com/40x30/${(m.away_team_code||'un').toLowerCase()}.png`} width={20} height={15} className="rounded-sm" alt="" />
      <span className="text-white/40 text-xs">{formatDate(m.match_date)} · {formatTime(m.match_date)} ET</span>
      <span className="text-white/20 mx-2">|</span>
    </span>
  ))

  return (
    <div className="w-full pb-24 md:pb-6 bg-[#0D0D1A]">

      {/* BANNER */}
      <div className="w-full" style={{maxHeight:'280px',overflow:'hidden'}}>
        <img src="/poolzone-banner.png" alt="PoolZone World Cup 2026" className="w-full object-cover object-center" style={{maxHeight:'280px'}} />
      </div>

      <div className="px-4 md:px-6 py-4">

        {/* COUNTDOWN + STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          {/* Countdown */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3">
            <p className="text-xs font-bold text-[#00C896] tracking-widest uppercase">World Cup Kicks Off In</p>
            <div className="flex items-center gap-2">
              <ClockBox v={cd.d} l="DAYS" />
              <span className="text-[#00C896] text-2xl font-black mb-4">:</span>
              <ClockBox v={cd.h} l="HRS" />
              <span className="text-[#00C896] text-2xl font-black mb-4">:</span>
              <ClockBox v={cd.m} l="MIN" />
              <span className="text-[#00C896] text-2xl font-black mb-4">:</span>
              <ClockBox v={cd.s} l="SEC" />
            </div>
            <p className="text-xs text-white/30">Jun 11 · 3:00 PM ET · Estadio Azteca</p>
          </div>

          {/* User card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} className="w-14 h-14 rounded-2xl object-cover border-2 border-[#00C896]/30" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-[#00C896]/10 border-2 border-[#00C896]/20 flex items-center justify-center">
                    <span className="text-2xl font-black text-[#00C896]">{profile?.username?.[0]?.toUpperCase()||'?'}</span>
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#22C55E] border-2 border-[#0D0D1A]" />
              </div>
              <div className="flex-1">
                <p className="font-black text-xl text-white">@{profile?.username||'player'}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <img src={`https://flagcdn.com/40x30/${teamCode}.png`} alt="" width={20} height={15} className="rounded-sm" />
                  <p className="text-xs text-white/50">{profile?.favorite_team||'-'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-3xl text-[#00C896]">{profile?.credits||0}</p>
                <p className="text-xs text-white/50 font-bold">Credits</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
              <div className="text-center">
                <p className="font-black text-2xl text-orange-400">{openBattles.length}</p>
                <p className="text-xs text-white/50">Challenges</p>
              </div>
              <div className="text-center">
                <p className="font-black text-2xl text-[#00C896]">{onlineCount}</p>
                <p className="text-xs text-white/50">🟢 Online</p>
              </div>
              <div className="text-center">
                <p className="font-black text-2xl text-[#74C0FC]">{registeredCount}</p>
                <p className="text-xs text-white/50">👥 Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* MATCH TICKER */}
        {matchTicker.length > 0 && (
          <div className="flex items-stretch overflow-hidden rounded-2xl border border-white/10 mb-4" style={{height:'48px'}}>
            <div className="shrink-0 bg-[#00C896] px-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-black font-black text-sm tracking-wider whitespace-nowrap">MATCHES</span>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div className="ticker-run">
                <div className="flex items-center h-full">{matchTicker}</div>
                <div className="flex items-center h-full">{matchTicker}</div>
              </div>
            </div>
          </div>
        )}

        {/* NAV BUTTONS */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          <NavBtn href="/schedule" icon={Calendar} label="Schedule" color="#60A5FA" />
          <NavBtn href="/ai-picks" icon={Sparkles} label="Oracle" color="#A855F7" />
          <NavBtn href="/my-picks" icon={Trophy} label="My Picks" color="#00C896" />
          <NavBtn href="/leaderboard" icon={BarChart2} label="Leaderboard" color="#00C896" />
          <NavBtn href="/challenges" icon={Zap} label="Challenges" color="#FB923C" />
          <NavBtn href="/chat" icon={MessageCircle} label="Chat" color="#00C896" />
          <NavBtn href="/how-to-play" icon={BookOpen} label="Rules" color="#F472B6" />
        </div>

        {/* OPEN CHALLENGES */}
        {openBattles.length > 0 && (
          <div className="mb-4 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-orange-400" />
                <h2 className="font-black text-base text-white tracking-wider">OPEN CHALLENGES</h2>
                <span className="bg-orange-400 text-black text-xs font-black px-1.5 py-0.5 rounded-full animate-pulse">{openBattles.length}</span>
              </div>
              <Link href="/challenges" className="text-xs font-bold text-[#00C896] hover:underline">See all</Link>
            </div>
            <div className="divide-y divide-white/10">
              {openBattles.slice(0,3).map((b: any) => (
                <Link href="/challenges" key={b.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-all">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{b.title}</p>
                    <p className="text-xs text-white/50">@{b.profiles?.username||'?'} — ${b.bet_amount} — {b.description}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-black text-base text-[#00C896]">${b.pot_total}</p>
                    <p className="text-[10px] text-white/40">in the pot</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* QUICK LINKS */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/wallet" className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all">
            <DollarSign size={20} className="text-[#00C896]" />
            <div>
              <p className="font-bold text-sm text-white">Wallet</p>
              <p className="text-xs text-white/40">{profile?.credits||0} credits available</p>
            </div>
          </Link>
          <Link href="/join" className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all">
            <RefreshCw size={20} className="text-[#A855F7]" />
            <div>
              <p className="font-bold text-sm text-white">Re-entry</p>
              <p className="text-xs text-white/40">+50 points for $25</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  )
}
