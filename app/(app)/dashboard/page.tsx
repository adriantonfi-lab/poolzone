export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Mark user as online con last_seen actualizado
  const now = new Date().toISOString()
  await supabase.from('profiles').update({ is_online: true, last_seen: now }).eq('id', user.id)

  // Online real = last_seen en los últimos 2 minutos
  const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()

  const [profileRes, matchesRes, onlineRes, registeredRes, battlesRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('matches').select('*').in('status', ['scheduled', 'live']).order('match_date', { ascending: true }).limit(4),
    supabase.from('profiles').select('id', { count: 'exact' }).gte('last_seen', twoMinsAgo),
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('battles').select('*, profiles!battles_created_by_fkey(username, avatar_url)').eq('status', 'open').order('created_at', { ascending: false }).limit(10),
  ])

  return (
    <DashboardClient
      profile={profileRes.data}
      matches={matchesRes.data || []}
      onlineCount={onlineRes.count || 0}
      registeredCount={registeredRes.count || 0}
      openBattles={battlesRes.data || []}
    />
  )
}
