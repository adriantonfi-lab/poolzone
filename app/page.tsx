// app/page.tsx — Landing page pública de PoolZone
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, Users, Zap, Shield, Star, ChevronRight, DollarSign } from 'lucide-react'

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
    <div className="flex items-center justify-center gap-3">
      {[{v:t.days,l:'DAYS'},{v:t.hours,l:'HRS'},{v:t.minutes,l:'MIN'},{v:t.seconds,l:'SEC'}].map(({v,l},i)=>(
        <div key={l} className="flex items-center gap-3">
          {i > 0 && <span className="text-[#00C896] text-4xl font-bold">:</span>}
          <div className="flex flex-col items-center">
            <div className="bg-black/50 border-2 border-[#00C896]/50 rounded-2xl px-4 py-3 min-w-[72px] text-center">
              <span className="text-5xl font-black text-[#00C896] leading-none">{String(v).padStart(2,'0')}</span>
            </div>
            <span className="text-xs font-bold text-white/60 mt-1 tracking-widest">{l}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function LandingPage() {
  const [pot, setPot] = useState(0)
  const [players, setPlayers] = useState(0)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/game/stats')
        const data = await res.json()
        setPot(data.pot || 0)
        setPlayers(data.players || 0)
      } catch {
        setPot(2280)
        setPlayers(100)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-[#0D0D1A] text-white">

      {/* NAV */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/10">
        <img src="/poolzone-logo.png" alt="PoolZone" className="h-10 object-contain" />
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-bold text-white/70 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="bg-[#00C896] text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#00b085] transition-all">
            Join Now
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00C896]/5 to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <img src="/poolzone-banner.png" alt="PoolZone World Cup 2026"
            className="w-full max-w-3xl mx-auto rounded-2xl mb-8 object-cover"
            style={{maxHeight: '340px'}} />

          {/* COUNTDOWN */}
          <p className="text-[#00C896] font-bold text-sm tracking-widest mb-4 uppercase">World Cup Starts In</p>
          <BigClock targetDate="2026-06-11T20:00:00Z" />

          {/* POT */}
          <div className="mt-8 bg-gradient-to-r from-[#FFD700]/10 to-[#00C896]/10 border border-[#FFD700]/30 rounded-2xl p-6 inline-block min-w-[280px]">
            <p className="text-sm font-bold text-white/60 uppercase tracking-widest mb-1">Current Prize Pool</p>
            <p className="text-6xl font-black text-[#FFD700]">${pot.toLocaleString()}</p>
            <p className="text-sm text-white/60 mt-1">{players} players · Growing every day</p>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register"
              className="w-full sm:w-auto bg-[#00C896] text-black font-black text-lg px-8 py-4 rounded-2xl hover:bg-[#00b085] transition-all flex items-center justify-center gap-2">
              Join the Pool — $30 <ChevronRight size={20} />
            </Link>
            <Link href="/how-to-play"
              className="w-full sm:w-auto border-2 border-white/20 text-white font-bold text-lg px-8 py-4 rounded-2xl hover:border-[#00C896] transition-all text-center">
              How It Works
            </Link>
          </div>
          <p className="text-xs text-white/40 mt-3">$30 entry · 60% goes to the winner · Secure payments</p>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-center font-black text-3xl mb-2">How It Works</h2>
        <p className="text-center text-white/50 mb-10">Simple. Fun. Real prizes.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { n: '1', icon: <DollarSign size={28} className="text-[#00C896]" />, title: 'Join for $30', desc: 'Pay once and you\'re in for the entire World Cup. All 104 matches.' },
            { n: '2', icon: <Star size={28} className="text-[#FFD700]" />, title: 'Predict Matches', desc: 'Pick winners, exact scores, and goal times. More detail = more points.' },
            { n: '3', icon: <Trophy size={28} className="text-[#FFD700]" />, title: 'Win the Prize', desc: 'Top 3 players split the pot. 1st gets 60%, 2nd 30%, 3rd 10%.' },
          ].map(({n, icon, title, desc}) => (
            <div key={n} className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                {icon}
              </div>
              <h3 className="font-black text-lg mb-2">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PRIZES */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-center font-black text-3xl mb-2">Prize Distribution</h2>
        <p className="text-center text-white/50 mb-10">Based on {players} players — pot grows as more join</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { place: '1st Place', pct: '60%', amount: Math.round(pot * 0.6), color: 'text-[#FFD700]', border: 'border-[#FFD700]/40', bg: 'bg-[#FFD700]/5' },
            { place: '2nd Place', pct: '30%', amount: Math.round(pot * 0.3), color: 'text-gray-300', border: 'border-gray-500/30', bg: 'bg-gray-500/5' },
            { place: '3rd Place', pct: '10%', amount: Math.round(pot * 0.1), color: 'text-amber-600', border: 'border-amber-600/30', bg: 'bg-amber-600/5' },
          ].map(({place, pct, amount, color, border, bg}) => (
            <div key={place} className={`${bg} border ${border} rounded-2xl p-4 text-center`}>
              <Trophy size={24} className={`${color} mx-auto mb-2`} />
              <p className={`font-black text-3xl ${color}`}>{pct}</p>
              <p className={`font-black text-xl ${color} mt-1`}>${amount.toLocaleString()}</p>
              <p className="text-xs text-white/40 mt-1">{place}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: <Users size={20} className="text-[#00C896]" />, title: 'For Families & Friends', desc: 'Play together with your crew. Latino community in USA.' },
            { icon: <Shield size={20} className="text-[#00C896]" />, title: 'Safe & Transparent', desc: 'Every payment tracked. Prize pot visible to all players.' },
            { icon: <Zap size={20} className="text-[#00C896]" />, title: 'Live Updates', desc: 'Real-time scores, push notifications for every goal.' },
          ].map(({icon, title, desc}) => (
            <div key={title} className="flex items-start gap-3 bg-[#1A1A2E] border border-white/10 rounded-xl p-4">
              <div className="w-9 h-9 rounded-xl bg-[#00C896]/10 flex items-center justify-center shrink-0">{icon}</div>
              <div>
                <p className="font-bold text-sm text-white">{title}</p>
                <p className="text-xs text-white/50 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="max-w-4xl mx-auto px-4 py-12 text-center border-t border-white/10">
        <h2 className="font-black text-4xl mb-4">Ready to Play?</h2>
        <p className="text-white/50 mb-8">Join {players}+ players competing for ${pot.toLocaleString()} in prizes</p>
        <Link href="/register"
          className="inline-flex items-center gap-2 bg-[#00C896] text-black font-black text-xl px-10 py-5 rounded-2xl hover:bg-[#00b085] transition-all">
          Join Now for $30 <ChevronRight size={24} />
        </Link>
        <p className="text-xs text-white/30 mt-4">poolzone.app · World Cup 2026 · Secure Payments</p>
      </div>

    </div>
  )
}
