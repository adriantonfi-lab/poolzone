'use client'

import Link from 'next/link'
import { ArrowLeft, Trophy, DollarSign, Star, Clock, RefreshCw, Sparkles, Zap, CheckCircle, Info } from 'lucide-react'

function Section({ icon, title, color, children }: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: `${color}15`}}>{icon}</div>
        <h2 className="font-black text-xl text-white">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Row({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-white/70">{label}</span>
      </div>
      <span className="text-sm font-bold" style={{color}}>{value}</span>
    </div>
  )
}

export default function HowToPlayPage() {
  return (
    <div className="px-4 py-6 max-w-3xl mx-auto pb-24 md:pb-6" style={{background:'#080812', minHeight:'100vh'}}>
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white mb-6">
        <ArrowLeft size={18} />Back to Dashboard
      </Link>

      <div className="text-center mb-8 p-6 rounded-2xl" style={{background:'rgba(0,200,150,0.06)', border:'1px solid rgba(0,200,150,0.2)'}}>
        <Trophy size={40} className="text-[#00C896] mx-auto mb-3" />
        <h1 className="text-4xl font-black text-white mb-2">How to Play</h1>
        <p className="text-white/50">PoolZone · World Cup 2026 · Everything you need to know</p>
      </div>

      <Section icon={<Info size={20} style={{color:'#00C896'}} />} title="What is PoolZone?" color="#00C896">
        <p className="text-white/60 text-sm leading-relaxed">PoolZone is a skill-based prediction game for the FIFA World Cup 2026. Predict match results, earn points, and compete for real cash prizes. The top 3 players split the prize pool at the end of the tournament.</p>
      </Section>

      <Section icon={<DollarSign size={20} style={{color:'#00C896'}} />} title="Entry & Prizes" color="#00C896">
        <Row icon={<DollarSign size={16} className="text-[#00C896]" />} label="Entry fee" value="$30 one-time" color="#00C896" />
        <Row icon={<Trophy size={16} style={{color:'#FFD700'}} />} label="1st Place" value="60% of the pot" color="#FFD700" />
        <Row icon={<Trophy size={16} className="text-gray-400" />} label="2nd Place" value="30% of the pot" color="#C0C0C0" />
        <Row icon={<Trophy size={16} style={{color:'#CD7F32'}} />} label="3rd Place" value="10% of the pot" color="#CD7F32" />
        <Row icon={<DollarSign size={16} className="text-[#00C896]" />} label="Welcome credits" value="$5 (50 credits)" color="#00C896" />
        <div className="mt-3 p-3 rounded-xl text-xs text-white/40" style={{background:'rgba(255,255,255,0.03)'}}>
          *Credits are for in-platform use only (Oracle, late modifications, Challenges) and cannot be withdrawn as cash.
        </div>
      </Section>

      <Section icon={<Star size={20} style={{color:'#FFD700'}} />} title="Scoring System" color="#FFD700">
        <Row icon={<Star size={16} style={{color:'#FFD700'}} />} label="Level 1 — Correct winner" value="20 pts" color="#FFD700" />
        <Row icon={<Star size={16} style={{color:'#FFD700'}} />} label="Level 2 — Exact score" value="+25 pts" color="#FFD700" />
        <Row icon={<Star size={16} style={{color:'#FFD700'}} />} label="Level 3 — Goals by half" value="+15 pts" color="#FFD700" />
        <Row icon={<Star size={16} style={{color:'#FFD700'}} />} label="Level 4 — Penalty winner (knockout)" value="+10 pts" color="#FFD700" />
        <Row icon={<Info size={16} className="text-white/40" />} label="Starting points" value="100 pts base" color="white" />
        <div className="mt-3 p-3 rounded-xl text-xs text-white/40" style={{background:'rgba(255,255,255,0.03)'}}>
          Special rule: If a match ends 0-0, only Level 1 points apply.
        </div>
      </Section>

      <Section icon={<Clock size={20} style={{color:'#FB923C'}} />} title="Late Modification Fees" color="#FB923C">
        <p className="text-white/50 text-sm mb-3">You can change your predictions before each match. Late changes incur a fee and reduce your points multiplier:</p>
        <Row icon={<CheckCircle size={16} className="text-[#00C896]" />} label="More than 24hrs before" value="Free · 100% points" color="#00C896" />
        <Row icon={<Clock size={16} style={{color:'#FB923C'}} />} label="Less than 24hrs before" value="$2 · 75% points" color="#FB923C" />
        <Row icon={<Clock size={16} className="text-red-400" />} label="Less than 15 minutes" value="$3 · 50% points" color="#f87171" />
        <Row icon={<Clock size={16} className="text-red-600" />} label="Less than 5 minutes" value="$5 · 25% points" color="#ef4444" />
      </Section>

      <Section icon={<RefreshCw size={20} style={{color:'#A855F7'}} />} title="Re-entry" color="#A855F7">
        <p className="text-white/50 text-sm mb-3">Available once per player during the Round of 16 phase only.</p>
        <Row icon={<DollarSign size={16} style={{color:'#A855F7'}} />} label="Re-entry cost" value="$25" color="#A855F7" />
        <Row icon={<Star size={16} style={{color:'#A855F7'}} />} label="Points added" value="+50 base points" color="#A855F7" />
        <p className="text-xs text-white/30 mt-3">Re-entry adds 50 points to your current score. New players who join during re-entry also receive 50 base points (not 100).</p>
      </Section>

      <Section icon={<Sparkles size={20} style={{color:'#A855F7'}} />} title="AI Oracle" color="#A855F7">
        <Row icon={<Sparkles size={16} style={{color:'#A855F7'}} />} label="Free queries included" value="12 per day" color="#A855F7" />
        <Row icon={<DollarSign size={16} style={{color:'#A855F7'}} />} label="Additional queries" value="$5 each" color="#A855F7" />
        <p className="text-white/50 text-sm mt-3">The Oracle AI analyzes match data and gives you insights to help make better predictions. Use it wisely!</p>
      </Section>

      <Section icon={<Zap size={20} style={{color:'#FB923C'}} />} title="Challenges" color="#FB923C">
        <p className="text-white/50 text-sm mb-3">Bet against other players on specific match outcomes.</p>
        <Row icon={<Zap size={16} style={{color:'#FB923C'}} />} label="PoolZone fee" value="10% of pot" color="#FB923C" />
        <Row icon={<Trophy size={16} className="text-[#00C896]" />} label="Winner receives" value="90% of pot" color="#00C896" />
      </Section>

      <Section icon={<Info size={20} className="text-white/50" />} title="Important Rules" color="#ffffff">
        {[
          'Predictions must be made before the match starts.',
          'During halftime (45-65 min), modifications are allowed.',
          'No bots or automated tools — immediate disqualification.',
          'Offensive language in chat results in account suspension.',
          'Prizes paid via Zelle (USA) or Wise (international) within 48hrs of the final.',
          'PoolZone is a skill-based game, not regulated sports betting.',
        ].map((rule, i) => (
          <div key={i} className="flex items-start gap-2 py-2 border-b border-white/5 last:border-0">
            <CheckCircle size={14} className="text-[#00C896] shrink-0 mt-0.5" />
            <p className="text-sm text-white/60">{rule}</p>
          </div>
        ))}
      </Section>

      <div className="text-center mt-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 bg-[#00C896] text-black font-black px-8 py-4 rounded-2xl text-base">
          Start Playing →
        </Link>
      </div>
    </div>
  )
}
