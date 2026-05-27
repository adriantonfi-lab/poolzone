'use client'

import Link from 'next/link'
import { Trophy, ArrowLeft, Users, Zap } from 'lucide-react'

const teamFlags: Record<string,string> = {
  'Argentina':'ar','Brasil':'br','Colombia':'co','Uruguay':'uy','México':'mx',
  'Estados Unidos':'us','España':'es','Francia':'fr','Portugal':'pt','Alemania':'de',
  'Inglaterra':'gb-eng','Marruecos':'ma','Senegal':'sn','Japón':'jp','Corea del Sur':'kr',
  'Países Bajos':'nl','Ecuador':'ec','Canadá':'ca','Paraguay':'py','Venezuela':'ve',
  'Bolivia':'bo','Perú':'pe','Chile':'cl','Costa Rica':'cr','Panamá':'pa',
  'Arabia Saudita':'sa','Australia':'au','Irán':'ir','Qatar':'qa','Croacia':'hr',
}

export default function RankingClient({ ranking, totalMatches, totalPot, userId }: {
  ranking: any[]; totalMatches: number; totalPot: number; userId: string
}) {
  const myRank = ranking.findIndex(p => p.id === userId) + 1
  const myData = ranking.find(p => p.id === userId)
  const medals = ['🥇','🥈','🥉']
  const medalColors = ['#FFD700','#C0C0C0','#CD7F32']

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto pb-24 md:pb-6" style={{background:'#080812',minHeight:'100vh'}}>
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white mb-6">
        <ArrowLeft size={18} />Back to Dashboard
      </Link>

      <h1 className="text-4xl font-black text-white mb-1">Leaderboard</h1>
      <p className="text-sm text-[#00C896] font-semibold mb-6">World Cup 2026 · Real-time rankings</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <Users size={20} className="text-[#00C896] mx-auto mb-2" />
          <p className="text-3xl font-black text-white">{ranking.length}</p>
          <p className="text-xs font-bold text-white/50">Players</p>
        </div>
        <div className="bg-white/5 border border-[#00C896]/20 rounded-2xl p-4 text-center">
          <Trophy size={20} className="text-[#00C896] mx-auto mb-2" />
          <p className="text-3xl font-black text-[#00C896]">${totalPot}</p>
          <p className="text-xs font-bold text-white/50">Prize Pool</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <Zap size={20} className="text-[#A855F7] mx-auto mb-2" />
          <p className="text-3xl font-black text-[#A855F7]">{totalMatches}</p>
          <p className="text-xs font-bold text-white/50">Matches</p>
        </div>
      </div>

      <div className="bg-white/5 border border-[#00C896]/20 rounded-2xl p-6 mb-6">
        <p className="text-sm font-black text-[#00C896] tracking-wider mb-4">PRIZE DISTRIBUTION</p>
        <div className="grid grid-cols-3 gap-4">
          {[{pct:60,medal:'🥇'},{pct:30,medal:'🥈'},{pct:10,medal:'🥉'}].map(({pct,medal},i)=>(
            <div key={i} className="text-center">
              <p className="text-4xl mb-2">{medal}</p>
              <p className="text-3xl font-black text-white">${Math.round(totalPot*pct/100)}</p>
              <p className="text-sm font-bold mt-1" style={{color:medalColors[i]}}>{pct}%</p>
            </div>
          ))}
        </div>
      </div>

      {myData && (
        <div className="bg-white/5 border-2 border-[#00C896]/40 rounded-2xl p-4 mb-6">
          <p className="text-xs font-bold text-[#00C896] uppercase tracking-wider mb-3">Your Position</p>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-black text-[#00C896]">#{myRank}</span>
            {myData.avatar_url ? (
              <img src={myData.avatar_url} alt={myData.username} className="w-12 h-12 rounded-xl object-cover border-2 border-[#00C896]/30" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#00C896]/10 flex items-center justify-center border-2 border-[#00C896]/20">
                <span className="text-2xl font-black text-[#00C896]">{myData.username?.[0]?.toUpperCase()}</span>
              </div>
            )}
            <div className="flex-1">
              <p className="text-xl font-black text-white">@{myData.username}</p>
              <p className="text-xs text-[#00C896] font-bold">{myData.predCount} predictions</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-[#00C896]">{myData.totalPoints}</p>
              <p className="text-xs text-white/50 font-bold">points</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
          <Trophy size={18} className="text-[#00C896]" />
          <h2 className="text-xl font-black text-white tracking-wider">Rankings</h2>
        </div>
        <div className="grid grid-cols-12 px-4 py-3 border-b border-white/5 text-xs font-bold text-white/30 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-6">Player</div>
          <div className="col-span-2 text-center">Team</div>
          <div className="col-span-3 text-right">Points</div>
        </div>
        {ranking.map((p, i) => {
          const isMe = p.id === userId
          const teamCode = teamFlags[p.favorite_team||'']||'un'
          return (
            <div key={p.id} className={`grid grid-cols-12 px-4 py-4 border-b border-white/5 last:border-0 items-center ${isMe ? 'bg-[#00C896]/5' : ''}`}>
              <div className="col-span-1">
                {i < 3
                  ? <span className="text-2xl">{medals[i]}</span>
                  : <span className="text-lg font-black" style={{color: isMe ? '#00C896' : 'rgba(255,255,255,0.4)'}}>{i+1}</span>
                }
              </div>
              <div className="col-span-6 flex items-center gap-3">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt={p.username} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[#00C896]/10 flex items-center justify-center shrink-0">
                    <span className="text-base font-black text-[#00C896]">{p.username?.[0]?.toUpperCase()}</span>
                  </div>
                )}
                <p className="font-bold text-sm truncate" style={{color: isMe ? '#00C896' : 'white'}}>
                  @{p.username}{isMe && <span className="text-xs opacity-50 ml-1">(you)</span>}
                </p>
              </div>
              <div className="col-span-2 flex justify-center">
                <img src={`https://flagcdn.com/40x30/${teamCode}.png`} alt="" width={24} height={18} className="rounded-sm" />
              </div>
              <div className="col-span-3 text-right">
                <span className="text-2xl font-black" style={{color: i < 3 ? medalColors[i] : isMe ? '#00C896' : 'white'}}>
                  {p.totalPoints}
                </span>
              </div>
            </div>
          )
        })}
        {ranking.length === 0 && (
          <div className="px-4 py-12 text-center text-white/40">No players yet — be the first!</div>
        )}
      </div>
    </div>
  )
}
