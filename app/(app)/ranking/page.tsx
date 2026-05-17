export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, ArrowLeft, Users, Zap } from 'lucide-react'

function FlagImg({ code, size = 20 }: { code: string; size?: number }) {
  return (
    <img src={`https://flagcdn.com/40x30/${(code||'un').toLowerCase()}.png`}
      alt={code} width={size} height={Math.round(size * 0.75)}
      className="rounded-sm object-cover" />
  )
}

const teamFlags: Record<string,string> = {
  'Argentina':'ar','Brasil':'br','Colombia':'co','Uruguay':'uy','México':'mx',
  'Estados Unidos':'us','España':'es','Francia':'fr','Portugal':'pt','Alemania':'de',
  'Inglaterra':'gb-eng','Marruecos':'ma','Senegal':'sn','Japón':'jp','Corea del Sur':'kr',
  'Países Bajos':'nl','Ecuador':'ec','Canadá':'ca','Paraguay':'py','Venezuela':'ve',
  'Bolivia':'bo','Perú':'pe','Chile':'cl','Costa Rica':'cr','Panamá':'pa',
  'Arabia Saudita':'sa','Australia':'au','Irán':'ir','Qatar':'qa','Croacia':'hr',
}

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Traer todos los perfiles con sus puntos de predicciones
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, favorite_team, credits, country_of_residence')
    .order('username', { ascending: true })

  // Traer puntos de predicciones por usuario
  const { data: predPoints } = await supabase
    .from('predictions')
    .select('user_id, points_earned')

  // Calcular puntos totales por usuario
  const pointsMap: Record<string, number> = {}
  const predCountMap: Record<string, number> = {}
  for (const p of predPoints || []) {
    pointsMap[p.user_id] = (pointsMap[p.user_id] || 0) + (p.points_earned || 0)
    predCountMap[p.user_id] = (predCountMap[p.user_id] || 0) + 1
  }

  // Total de partidos
  const { count: totalMatches } = await supabase
    .from('matches')
    .select('*', { count: 'exact' })

  // Combinar y ordenar por puntos
  const ranking = (profiles || [])
    .map(p => ({
      ...p,
      totalPoints: pointsMap[p.id] || 0,
      predCount: predCountMap[p.id] || 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)

  const myRank = ranking.findIndex(p => p.id === user.id) + 1
  const myData = ranking.find(p => p.id === user.id)

  // Calcular pozo total (inscripciones simuladas por ahora)
  const totalPot = ranking.length * 25 // $25 por participante base

  const medalColors = ['text-[#FFD700]', 'text-gray-300', 'text-amber-600']
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto pb-24 md:pb-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-base font-bold text-white hover:text-[#FFD700] transition-colors mb-4">
        <ArrowLeft size={20} />Volver al Dashboard
      </Link>

      <h1 className="font-bebas text-5xl text-white tracking-wider mb-1">Posiciones</h1>
      <p className="text-sm font-semibold text-[#86EFAC] mb-6">Mundial 2026 · Actualizado en tiempo real</p>

      {/* Stats generales */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-4 text-center">
          <Users size={20} className="text-[#22C55E] mx-auto mb-1" />
          <p className="font-bebas text-3xl text-white">{ranking.length}</p>
          <p className="text-xs font-bold text-white">Participantes</p>
        </div>
        <div className="bg-[#1A1A2E] border border-[#FFD700]/20 rounded-2xl p-4 text-center">
          <Trophy size={20} className="text-[#FFD700] mx-auto mb-1" />
          <p className="font-bebas text-3xl text-[#FFD700]">${totalPot}</p>
          <p className="text-xs font-bold text-white">Pozo total</p>
        </div>
        <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-4 text-center">
          <Zap size={20} className="text-[#A855F7] mx-auto mb-1" />
          <p className="font-bebas text-3xl text-[#A855F7]">{totalMatches || 0}</p>
          <p className="text-xs font-bold text-white">Partidos</p>
        </div>
      </div>

      {/* Premio estimado */}
      <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 border border-[#FFD700]/30 rounded-2xl p-4 mb-6">
        <p className="font-bebas text-lg text-[#FFD700] tracking-wider mb-3">PREMIOS ESTIMADOS</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { place: '1°', pct: 60, medal: '🥇' },
            { place: '2°', pct: 30, medal: '🥈' },
            { place: '3°', pct: 10, medal: '🥉' },
          ].map(({ place, pct, medal }) => (
            <div key={place} className="text-center">
              <p className="text-2xl mb-1">{medal}</p>
              <p className="font-bebas text-2xl text-white">${Math.round(totalPot * pct / 100)}</p>
              <p className="text-xs text-[#FFD700] font-bold">{place} — {pct}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mi posición */}
      {myData && (
        <div className="bg-[#1A1A2E] border-2 border-[#FFD700]/50 rounded-2xl p-4 mb-6">
          <p className="text-xs font-bold text-[#FFD700] uppercase tracking-wider mb-3">Tu posición</p>
          <div className="flex items-center gap-4">
            <span className="font-bebas text-4xl text-[#FFD700]">#{myRank}</span>
            {myData.avatar_url ? (
              <img src={myData.avatar_url} alt={myData.username}
                className="w-12 h-12 rounded-xl object-cover border-2 border-[#FFD700]/40" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#FFD700]/20 flex items-center justify-center">
                <span className="font-bebas text-2xl text-[#FFD700]">{myData.username?.[0]?.toUpperCase()}</span>
              </div>
            )}
            <div className="flex-1">
              <p className="font-bebas text-2xl text-white">@{myData.username}</p>
              <p className="text-xs text-[#86EFAC] font-bold">{myData.predCount} predicciones guardadas</p>
            </div>
            <div className="text-right">
              <p className="font-bebas text-4xl text-[#FFD700]">{myData.totalPoints}</p>
              <p className="text-xs text-white font-bold">puntos</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla completa */}
      <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2A2A4A] flex items-center gap-2">
          <Trophy size={16} className="text-[#FFD700]" />
          <h2 className="font-bebas text-xl text-[#FFD700] tracking-wider">Tabla de Posiciones</h2>
        </div>

        {/* Header */}
        <div className="grid grid-cols-12 px-4 py-2 border-b border-[#2A2A4A] text-xs font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Jugador</div>
          <div className="col-span-2 text-center">Equipo</div>
          <div className="col-span-2 text-center">Pred.</div>
          <div className="col-span-2 text-right">Puntos</div>
        </div>

        {ranking.map((p, i) => {
          const isMe = p.id === user.id
          const teamCode = teamFlags[p.favorite_team || ''] || 'un'
          return (
            <div key={p.id}
              className={`grid grid-cols-12 px-4 py-3 border-b border-[#2A2A4A] last:border-0 items-center transition-all ${
                isMe ? 'bg-[#FFD700]/5' : 'hover:bg-white/2'
              }`}>
              {/* Posición */}
              <div className="col-span-1">
                {i < 3 ? (
                  <span className="text-xl">{medals[i]}</span>
                ) : (
                  <span className={`font-bebas text-lg ${isMe ? 'text-[#FFD700]' : 'text-gray-400'}`}>
                    {i + 1}
                  </span>
                )}
              </div>

              {/* Jugador */}
              <div className="col-span-5 flex items-center gap-2">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt={p.username}
                    className="w-9 h-9 rounded-xl object-cover border border-white/10 shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-[#FFD700]/20 flex items-center justify-center shrink-0">
                    <span className="font-bebas text-base text-[#FFD700]">{p.username?.[0]?.toUpperCase()}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className={`font-bold text-sm truncate ${isMe ? 'text-[#FFD700]' : 'text-white'}`}>
                    @{p.username}
                    {isMe && <span className="text-xs text-[#FFD700]/60 ml-1">(vos)</span>}
                  </p>
                </div>
              </div>

              {/* Equipo */}
              <div className="col-span-2 flex justify-center">
                <FlagImg code={teamCode} size={22} />
              </div>

              {/* Predicciones */}
              <div className="col-span-2 text-center">
                <span className="text-sm font-bold text-white">{p.predCount}</span>
                <span className="text-xs text-gray-400">/{totalMatches}</span>
              </div>

              {/* Puntos */}
              <div className="col-span-2 text-right">
                <span className={`font-bebas text-2xl ${i < 3 ? medalColors[i] : isMe ? 'text-[#FFD700]' : 'text-white'}`}>
                  {p.totalPoints}
                </span>
              </div>
            </div>
          )
        })}

        {ranking.length === 0 && (
          <div className="px-4 py-12 text-center text-white">
            Todavía no hay participantes con predicciones guardadas.
          </div>
        )}
      </div>
    </div>
  )
}
