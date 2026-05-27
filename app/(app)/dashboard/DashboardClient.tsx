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
      <img src={`https://flagcdn.com/40x30/${(m.home_team_code||'un').toLowerCase()}.png`} width={22} height={16} style={{ borderRadius: '2px' }} alt="" />
      {m.home_team}
      <span style={{ color: '#00C896', fontWeight: 900 }}>vs</span>
      {m.away_team}
      <img src={`https://flagcdn.com/40x30/${(m.away_team_code||'un').toLowerCase()}.png`} width={22} height={16} style={{ borderRadius: '2px' }} alt="" />
      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{formatDate(m.match_date)} · {formatTime(m.match_date)} ET</span>
      <span style={{ color: 'rgba(255,255,255,0.12)', margin: '0 8px' }}>|</span>
    </span>
  ))

  return (
    <div style={{ minHeight: '100vh', background: '#080812', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '100px' }}>

      {/* FULL BANNER — no crop */}
      <div style={{ width: '100%' }}>
        <img src="/poolzone-banner.png" alt="PoolZone World Cup 2026"
          style={{ width: '100%', display: 'block' }} />
      </div>

      {/* COUNTDOWN HERO */}
      <div style={{
        background: 'linear-gradient(180deg, #0D0D20 0%, #080812 100%)',
        padding: '32px 20px 28px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(0,200,150,0.15)',
      }}>
        <p style={{ fontSize: '11px', fontWeight: 800, color: '#00C896', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '20px', margin: '0 0 20px' }}>
          ⚽ World Cup Kicks Off In ⚽
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '8px' }}>
          {[{v:cd.d,l:'DAYS'},{v:cd.h,l:'HRS'},{v:cd.m,l:'MIN'},{v:cd.s,l:'SEC'}].map(({v,l},i)=>(
            <div key={l} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              {i > 0 && <span style={{ fontSize: '52px', fontWeight: 900, color: '#00C896', lineHeight: '100px', opacity: 0.6 }}>:</span>}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  background: 'rgba(0,200,150,0.08)',
                  border: '2px solid rgba(0,200,150,0.35)',
                  borderRadius: '20px',
                  minWidth: '90px',
                  height: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(0,200,150,0.1)',
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '52px', fontWeight: 900, color: '#00C896', display: 'block', width: '2ch', textAlign: 'center', lineHeight: 1 }}>
                    {String(v).padStart(2,'0')}
                  </span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>{l}</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', margin: '16px 0 0', fontWeight: 500 }}>
          Jun 11 · 3:00 PM ET · Estadio Azteca · Mexico City
        </p>
      </div>

      {/* MATCH TICKER */}
      {matchTicker.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'stretch', overflow: 'hidden', height: '52px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ flexShrink: 0, background: '#00C896', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ color: 'black', fontWeight: 900, fontSize: '13px', letterSpacing: '2px', whiteSpace: 'nowrap' }}>LIVE</span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div className="ticker-run" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>{matchTicker}</div>
              <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>{matchTicker}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '20px 16px' }}>

        {/* USER CARD — BIG */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,200,150,0.1) 0%, rgba(0,200,150,0.03) 100%)',
          border: '1px solid rgba(0,200,150,0.2)',
          borderRadius: '24px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username}
                  style={{ width: '64px', height: '64px', borderRadius: '18px', objectFit: 'cover', border: '3px solid rgba(0,200,150,0.4)' }} />
              ) : (
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(0,200,150,0.15)', border: '3px solid rgba(0,200,150,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '28px', fontWeight: 900, color: '#00C896' }}>{profile?.username?.[0]?.toUpperCase()||'?'}</span>
                </div>
              )}
              <span style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '16px', height: '16px', borderRadius: '50%', background: '#22C55E', border: '3px solid #080812' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 900, fontSize: '22px', color: 'white', margin: '0 0 4px', lineHeight: 1 }}>@{profile?.username||'player'}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img src={`https://flagcdn.com/40x30/${teamCode}.png`} alt="" width={22} height={16} style={{ borderRadius: '3px' }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{profile?.favorite_team||'World Cup 2026'}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 900, fontSize: '36px', color: '#00C896', margin: 0, lineHeight: 1 }}>{profile?.credits||0}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', fontWeight: 700, letterSpacing: '1px' }}>CREDITS</p>
            </div>
          </div>

          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', borderTop: '1px solid rgba(0,200,150,0.15)', paddingTop: '16px' }}>
            <div style={{ textAlign: 'center', background: 'rgba(251,146,60,0.08)', borderRadius: '14px', padding: '12px 8px' }}>
              <p style={{ fontWeight: 900, fontSize: '32px', color: '#FB923C', margin: 0, lineHeight: 1 }}>{openBattles.length}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '6px 0 0', fontWeight: 700 }}>CHALLENGES</p>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(34,197,94,0.08)', borderRadius: '14px', padding: '12px 8px' }}>
              <p style={{ fontWeight: 900, fontSize: '32px', color: '#22C55E', margin: 0, lineHeight: 1 }}>{onlineCount}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '6px 0 0', fontWeight: 700 }}>🟢 ONLINE</p>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(116,192,252,0.08)', borderRadius: '14px', padding: '12px 8px' }}>
              <p style={{ fontWeight: 900, fontSize: '32px', color: '#74C0FC', margin: 0, lineHeight: 1 }}>{registeredCount}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '6px 0 0', fontWeight: 700 }}>👥 PLAYERS</p>
            </div>
          </div>
        </div>

        {/* NAV BUTTONS — 2 rows */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
          {[
            { href: '/schedule', icon: Calendar, label: 'Schedule', color: '#60A5FA', bg: 'rgba(96,165,250,0.08)' },
            { href: '/my-picks', icon: Trophy, label: 'My Picks', color: '#00C896', bg: 'rgba(0,200,150,0.08)' },
            { href: '/leaderboard', icon: BarChart2, label: 'Leaderboard', color: '#00C896', bg: 'rgba(0,200,150,0.08)' },
            { href: '/challenges', icon: Zap, label: 'Challenges', color: '#FB923C', bg: 'rgba(251,146,60,0.08)' },
          ].map(({ href, icon: Icon, label, color, bg }) => (
            <Link key={href} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 8px', borderRadius: '18px', background: bg, border: `1px solid ${color}25`, textDecoration: 'none' }}>
              <Icon size={28} style={{ color }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'white', textAlign: 'center' }}>{label}</span>
            </Link>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { href: '/ai-picks', icon: Sparkles, label: 'Oracle', color: '#A855F7', bg: 'rgba(168,85,247,0.08)' },
            { href: '/chat', icon: MessageCircle, label: 'Chat', color: '#00C896', bg: 'rgba(0,200,150,0.08)' },
            { href: '/how-to-play', icon: BookOpen, label: 'Rules', color: '#F472B6', bg: 'rgba(244,114,182,0.08)' },
          ].map(({ href, icon: Icon, label, color, bg }) => (
            <Link key={href} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 8px', borderRadius: '18px', background: bg, border: `1px solid ${color}25`, textDecoration: 'none' }}>
              <Icon size={28} style={{ color }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'white', textAlign: 'center' }}>{label}</span>
            </Link>
          ))}
        </div>

        {/* OPEN CHALLENGES */}
        {openBattles.length > 0 && (
          <div style={{ background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.15)', borderRadius: '20px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(251,146,60,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} style={{ color: '#FB923C' }} />
                <span style={{ fontWeight: 900, fontSize: '15px', color: 'white' }}>OPEN CHALLENGES</span>
                <span style={{ background: '#FB923C', color: 'black', fontSize: '12px', fontWeight: 900, padding: '3px 8px', borderRadius: '100px' }}>{openBattles.length}</span>
              </div>
              <Link href="/challenges" style={{ fontSize: '13px', fontWeight: 700, color: '#00C896', textDecoration: 'none' }}>See all →</Link>
            </div>
            {openBattles.slice(0, 3).map((b: any) => (
              <Link href="/challenges" key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'white', margin: 0 }}>{b.title}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>@{b.profiles?.username||'?'} · ${b.bet_amount}</p>
                </div>
                <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                  <p style={{ fontWeight: 900, fontSize: '18px', color: '#FB923C', margin: 0 }}>${b.pot_total}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>in pot</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* WALLET + RE-ENTRY */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Link href="/wallet" style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.15)', borderRadius: '18px', padding: '18px', textDecoration: 'none' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(0,200,150,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <DollarSign size={24} style={{ color: '#00C896' }} />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '15px', color: 'white', margin: 0 }}>Wallet</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>{profile?.credits||0} credits</p>
            </div>
          </Link>
          <Link href="/join" style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: '18px', padding: '18px', textDecoration: 'none' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(168,85,247,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <RefreshCw size={24} style={{ color: '#A855F7' }} />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '15px', color: 'white', margin: 0 }}>Re-entry</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>+50 pts · $25</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  )
}
