'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Sparkles, Trophy, BarChart2, Zap, MessageCircle, BookOpen, DollarSign, RefreshCw, Star } from 'lucide-react'

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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{
        background: 'rgba(0,200,150,0.08)',
        border: '2px solid rgba(0,200,150,0.3)',
        borderRadius: '16px',
        width: '80px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'monospace', fontSize: '38px', fontWeight: 900, color: '#00C896', display: 'block', width: '2ch', textAlign: 'center', lineHeight: 1 }}>
          {String(v).padStart(2, '0')}
        </span>
      </div>
      <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '2px' }}>{l}</span>
    </div>
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
    return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' })
  }
  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/New_York' })
  }

  useEffect(() => {
    async function heartbeat() { await fetch('/api/heartbeat', { method: 'POST' }) }
    heartbeat()
    const id = setInterval(heartbeat, 30000)
    return () => clearInterval(id)
  }, [])

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
    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', padding: '0 20px' }}>
      <img src={`https://flagcdn.com/40x30/${(m.home_team_code||'un').toLowerCase()}.png`} width={20} height={15} style={{ borderRadius: '2px' }} alt="" />
      {m.home_team}
      <span style={{ color: '#00C896' }}>vs</span>
      {m.away_team}
      <img src={`https://flagcdn.com/40x30/${(m.away_team_code||'un').toLowerCase()}.png`} width={20} height={15} style={{ borderRadius: '2px' }} alt="" />
      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{formatDate(m.match_date)} · {formatTime(m.match_date)} ET</span>
      <span style={{ color: 'rgba(255,255,255,0.15)', margin: '0 8px' }}>|</span>
    </span>
  ))

  const navButtons = [
    { href: '/schedule', icon: Calendar, label: 'Schedule', color: '#60A5FA' },
    { href: '/ai-picks', icon: Sparkles, label: 'Oracle', color: '#A855F7' },
    { href: '/my-picks', icon: Trophy, label: 'My Picks', color: '#00C896' },
    { href: '/leaderboard', icon: BarChart2, label: 'Leaderboard', color: '#00C896' },
    { href: '/challenges', icon: Zap, label: 'Challenges', color: '#FB923C' },
    { href: '/chat', icon: MessageCircle, label: 'Chat', color: '#00C896' },
    { href: '/how-to-play', icon: BookOpen, label: 'Rules', color: '#F472B6' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A14', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '96px' }}>

      {/* HERO BANNER */}
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden', maxHeight: '260px' }}>
        <img src="/poolzone-banner.png" alt="PoolZone World Cup 2026"
          style={{ width: '100%', display: 'block', objectFit: 'cover', objectPosition: 'center', maxHeight: '260px' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, #0A0A14 100%)' }} />
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* COUNTDOWN */}
        <div style={{ textAlign: 'center', padding: '24px 0 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#00C896', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>
            World Cup Kicks Off In
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
            <ClockBox v={cd.d} l="DAYS" />
            <span style={{ color: '#00C896', fontSize: '36px', fontWeight: 900, marginBottom: '20px' }}>:</span>
            <ClockBox v={cd.h} l="HRS" />
            <span style={{ color: '#00C896', fontSize: '36px', fontWeight: 900, marginBottom: '20px' }}>:</span>
            <ClockBox v={cd.m} l="MIN" />
            <span style={{ color: '#00C896', fontSize: '36px', fontWeight: 900, marginBottom: '20px' }}>:</span>
            <ClockBox v={cd.s} l="SEC" />
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '12px' }}>
            Jun 11 · 3:00 PM ET · Estadio Azteca · Mexico City
          </p>
        </div>

        {/* MATCH TICKER */}
        {matchTicker.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'stretch', overflow: 'hidden', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px', height: '48px' }}>
            <div style={{ flexShrink: 0, background: '#00C896', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'inline-block' }} className="animate-pulse" />
              <span style={{ color: 'black', fontWeight: 900, fontSize: '12px', letterSpacing: '2px', whiteSpace: 'nowrap' }}>MATCHES</span>
            </div>
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <div className="ticker-run" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>{matchTicker}</div>
                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>{matchTicker}</div>
              </div>
            </div>
          </div>
        )}

        {/* USER CARD */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} style={{ width: '52px', height: '52px', borderRadius: '14px', objectFit: 'cover', border: '2px solid rgba(0,200,150,0.3)' }} />
              ) : (
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(0,200,150,0.1)', border: '2px solid rgba(0,200,150,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#00C896' }}>{profile?.username?.[0]?.toUpperCase()||'?'}</span>
                </div>
              )}
              <span style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '12px', height: '12px', borderRadius: '50%', background: '#22C55E', border: '2px solid #0A0A14' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p style={{ fontWeight: 900, fontSize: '18px', color: 'white', margin: 0 }}>@{profile?.username||'player'}</p>
                <img src={`https://flagcdn.com/40x30/${teamCode}.png`} alt="" width={20} height={15} style={{ borderRadius: '2px' }} />
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{profile?.favorite_team||'World Cup 2026'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 900, fontSize: '28px', color: '#00C896', margin: 0, lineHeight: 1 }}>{profile?.credits||0}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0', fontWeight: 700 }}>CREDITS</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
            {[
              { val: openBattles.length, label: 'Challenges', color: '#FB923C' },
              { val: onlineCount, label: '🟢 Online', color: '#22C55E' },
              { val: registeredCount, label: '👥 Players', color: '#74C0FC' },
            ].map(({ val, label, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 900, fontSize: '24px', color, margin: 0, lineHeight: 1 }}>{val}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', fontWeight: 700 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* NAV BUTTONS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '20px' }}>
          {navButtons.map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              padding: '12px 4px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              textDecoration: 'none', transition: 'all 0.2s',
            }}>
              <Icon size={22} style={{ color }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'white', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
            </Link>
          ))}
        </div>

        {/* OPEN CHALLENGES */}
        {openBattles.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} style={{ color: '#FB923C' }} />
                <span style={{ fontWeight: 900, fontSize: '14px', color: 'white', letterSpacing: '1px' }}>OPEN CHALLENGES</span>
                <span style={{ background: '#FB923C', color: 'black', fontSize: '11px', fontWeight: 900, padding: '2px 7px', borderRadius: '100px' }}>{openBattles.length}</span>
              </div>
              <Link href="/challenges" style={{ fontSize: '12px', fontWeight: 700, color: '#00C896', textDecoration: 'none' }}>See all</Link>
            </div>
            {openBattles.slice(0, 3).map((b: any) => (
              <Link href="/challenges" key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'white', margin: 0 }}>{b.title}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>@{b.profiles?.username||'?'} · ${b.bet_amount} · {b.description}</p>
                </div>
                <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                  <p style={{ fontWeight: 900, fontSize: '16px', color: '#00C896', margin: 0 }}>${b.pot_total}</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>in the pot</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* QUICK ACTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Link href="/wallet" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.15)', borderRadius: '16px', padding: '16px', textDecoration: 'none' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,200,150,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <DollarSign size={20} style={{ color: '#00C896' }} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '14px', color: 'white', margin: 0 }}>Wallet</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{profile?.credits||0} credits</p>
            </div>
          </Link>
          <Link href="/join" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: '16px', padding: '16px', textDecoration: 'none' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <RefreshCw size={20} style={{ color: '#A855F7' }} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '14px', color: 'white', margin: 0 }}>Re-entry</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>+50 pts · $25</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  )
}
