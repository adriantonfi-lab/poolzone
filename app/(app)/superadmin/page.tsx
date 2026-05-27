export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import SuperAdminClient from './SuperAdminClient'

export default async function SuperAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') redirect('/dashboard')

  const supabaseAdmin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || 'process.env.SUPABASE_SERVICE_ROLE_KEY!'
  )

  const [
    profilesRes,
    matchesRes,
    predictionsRes,
    battlesRes,
    paymentsRes,
    messagesRes,
    oracleRes,
    challengesRes,
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('matches').select('*').order('match_date', { ascending: true }),
    supabaseAdmin.from('predictions').select('*'),
    supabaseAdmin.from('battles').select('*, profiles!battles_created_by_fkey(username)').order('created_at', { ascending: false }),
    supabaseAdmin.from('payment_proofs').select('*, profiles(username, avatar_url)').order('created_at', { ascending: false }),
    supabaseAdmin.from('chat_messages').select('*, profiles(username)').order('created_at', { ascending: false }).limit(50),
    supabaseAdmin.from('oracle_queries').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('challenges').select('*, matches(home_team, away_team)').order('created_at', { ascending: false }),
  ])

  // Traer emails desde auth.users
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
  const emailMap: Record<string, string> = {}
  const lastSignInMap: Record<string, string> = {}
  for (const u of authUsers?.users || []) {
    emailMap[u.id] = u.email || ''
    lastSignInMap[u.id] = u.last_sign_in_at || ''
  }

  return (
    <SuperAdminClient
      profiles={profilesRes.data || []}
      matches={matchesRes.data || []}
      predictions={predictionsRes.data || []}
      battles={battlesRes.data || []}
      payments={paymentsRes.data || []}
      messages={messagesRes.data || []}
      oracleQueries={oracleRes.data || []}
      challenges={challengesRes.data || []}
      emailMap={emailMap}
      lastSignInMap={lastSignInMap}
    />
  )
}
