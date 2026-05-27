export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RankingClient from './RankingClient'

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, favorite_team, credits, country_of_residence, base_points, reenganche_used, reenganche_points, inscription_status')
    .order('username', { ascending: true })

  const { data: predPoints } = await supabase
    .from('predictions')
    .select('user_id, points_earned')

  const pointsMap: Record<string, number> = {}
  const predCountMap: Record<string, number> = {}
  for (const p of predPoints || []) {
    pointsMap[p.user_id] = (pointsMap[p.user_id] || 0) + (p.points_earned || 0)
    predCountMap[p.user_id] = (predCountMap[p.user_id] || 0) + 1
  }

  const { count: totalMatches } = await supabase
    .from('matches')
    .select('*', { count: 'exact' })

  const ranking = (profiles || [])
    .filter(p => p.inscription_status === 'paid' || p.inscription_status === 'approved')
    .map(p => ({
      ...p,
      // Points totales = puntos de predictions + puntos base (100 inicio o 50 re-entry)
      totalPoints: (pointsMap[p.id] || 0) + (p.base_points || 100) + (p.reenganche_points || 0),
      predCount: predCountMap[p.id] || 0,
      reenganche: p.reenganche_used || false,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)

  const totalPot = ranking.length * 25

  return (
    <RankingClient
      ranking={ranking}
      totalMatches={totalMatches || 0}
      totalPot={totalPot}
      userId={user.id}
    />
  )
}
