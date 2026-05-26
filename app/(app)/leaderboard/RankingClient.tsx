'use client'

import { useTranslations } from 'next-intl'
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

function FlagImg({ code, size = 28 }: { code: string; size?: number }) {
  return (
    <img src={`https://flagcdn.com/40x30/${(code||'un').toLowerCase()}.png`}
      alt={code} width={size} height={Math.round(size * 0.75)}
      className="rounded-sm object-cover" />
  )
}

export default function RankingClient({ ranking, totalMatches, totalPot, userId }: {
  ranking: any[]
  totalMatches: number
  totalPot: number
  userId: string
}) {
  const t = useTranslations('ranking')
  const tc = useTranslations('common')

  const myRank = ranking.findIndex(p => p.id === userId) + 1
  const myData = ranking.find(p => p.id === userId)
  const medalColors = ['text-[#FFD700]', 'text-gray-300', 'text-amber-600']
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto pb-24 md:pb-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-base font-bold text-white hover:text-[#FFD700] transition-colors mb-4">
        <ArrowLeft size={20} />{tc('back')}
      </Link>

      <h1 className="font-bebas text-5xl text-white tracking-wider mb-1">{t('title')}</h1>
      <p className="text-sm font-semibold text-[#86EFAC] mb-6">{t('subtitle')}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-4 text-center">
          <Users size={20} className="text-[#22C55E] mx-auto mb-1" />
          <p className="font-bebas text-3xl text-white">{ranking.length}</p>
          <p className="text-xs font-bold text-white">{t('participants')}</p>
        </div>
        <div className="bg-[#1A1A2E] border border-[#FFD700]/20 rounded-2xl p-4 text-center">
          <Trophy size={20} className="text-[#FFD700] mx-auto mb-1" />
          <p className="font-bebas text-3xl text-[#FFD700]">${totalPot}</p>
          <p className="text-xs font-bold text-white">{t('totalPot')}</p>
        </div>
        <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-4 text-center">
          <Zap size={20} className="text-[#A855F7] mx-auto mb-1" />
          <p className="font-bebas text-3xl text-[#A855F7]">{totalMatches}</p>
          <p className="text-xs font-bold text-white">{t('matches')}</p>
        </div>
      </div>

      {/* Premios — MÁS GRANDES */}
      <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 border border-[#FFD700]/30 rounded-2xl p-6 mb-6">
        <p className="font-bebas text-xl text-[#FFD700] tracking-wider mb-4">{t('prizes')}</p>
        <div className="grid grid-cols-3 gap-4">
          {[{place:'1°',pct:60,medal:'🥇'},{place:'2°',pct:30,medal:'🥈'},{place:'3°',pct:10,medal:'🥉'}].map(({place,pct,medal}) => (
            <div key={place} className="text-center">
              <p className="text-5xl mb-2">{medal}</p>
              <p className="font-bebas text-4xl text-white">${Math.round(totalPot * pct / 100)}</p>
              <p className="text-sm text-[#FFD700] font-bold mt-1">{place} — {pct}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mi posición */}
      {myData && (
        <div className="bg-[#1A1A2E] border-2 border-[#FFD700]/50 rounded-2xl p-4 mb-6">
          <p className="text-xs font-bold text-[#FFD700] uppercase tracking-wider mb-3">{t('yourPosition')}</p>
          <div className="flex items-center gap-4">
            <span className="font-bebas text-4xl text-[#FFD700]">#{myRank}</span>
            {myData.avatar_url ? (
              <img src={myData.avatar_url} alt={myData.username} className="w-12 h-12 rounded-xl object-cover border-2 border-[#FFD700]/40" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#FFD700]/20 flex items-center justify-center">
                <span className="font-bebas text-2xl text-[#FFD700]">{myData.username?.[0]?.toUpperCase()}</span>
              </div>
            )}
            <div className="flex-1">
              <p className="font-bebas text-2xl text-white">@{myData.username}</p>
              <p className="text-xs text-[#86EFAC] font-bold">{myData.predCount} {t('predictions')}</p>
            </div>
            <div className="text-right">
              <p className="font-bebas text-4xl text-[#FFD700]">{myData.totalPoints}</p>
              <p className="text-xs text-white font-bold">{t('points')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla — MÁS GRANDE */}
      <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2A2A4A] flex items-center gap-2">
          <Trophy size={18} className="text-[#FFD700]" />
          <h2 className="font-bebas text-2xl text-[#FFD700] tracking-wider">{t('table')}</h2>
        </div>

        {/* Headers */}
        <div className="grid grid-cols-12 px-4 py-3 border-b border-[#2A2A4A] text-sm font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-5">{t('table')}</div>
          <div className="col-span-2 text-center">{t('team')}</div>
          <div className="col-span-2 text-center">{t('pred')}</div>
          <div className="col-span-2 text-right">{t('points')}</div>
        </div>

        {ranking.map((p, i) => {
          const isMe = p.id === userId
          const teamCode = teamFlags[p.favorite_team || ''] || 'un'
          return (
            <div key={p.id} className={`grid grid-cols-12 px-4 py-4 border-b border-[#2A2A4A] last:border-0 items-center transition-all ${isMe ? 'bg-[#FFD700]/5' : 'hover:bg-white/2'}`}>
              {/* # */}
              <div className="col-span-1">
                {i < 3
                  ? <span className="text-2xl">{medals[i]}</span>
                  : <span className={`font-bebas text-xl ${isMe ? 'text-[#FFD700]' : 'text-gray-400'}`}>{i + 1}</span>
                }
              </div>

              {/* Usuario */}
              <div className="col-span-5 flex items-center gap-3">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt={p.username} className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-[#FFD700]/20 flex items-center justify-center shrink-0">
                    <span className="font-bebas text-lg text-[#FFD700]">{p.username?.[0]?.toUpperCase()}</span>
                  </div>
                )}
                <p className={`font-bold text-base truncate ${isMe ? 'text-[#FFD700]' : 'text-white'}`}>
                  @{p.username}
                  {isMe && <span className="text-xs text-[#FFD700]/60 ml-1">({t('you')})</span>}
                </p>
              </div>

              {/* Equipo */}
              <div className="col-span-2 flex justify-center">
                <FlagImg code={teamCode} size={28} />
              </div>

              {/* Predicciones */}
              <div className="col-span-2 text-center">
                <span className="text-base font-bold text-white">{p.predCount}</span>
                <span className="text-sm text-gray-400">/{totalMatches}</span>
              </div>

              {/* Puntos */}
              <div className="col-span-2 text-right">
                <span className={`font-bebas text-3xl ${i < 3 ? medalColors[i] : isMe ? 'text-[#FFD700]' : 'text-white'}`}>
                  {p.totalPoints}
                </span>
              </div>
            </div>
          )
        })}

        {ranking.length === 0 && (
          <div className="px-4 py-12 text-center text-white">
            {t('subtitle')}
          </div>
        )}
      </div>
    </div>
  )
}
