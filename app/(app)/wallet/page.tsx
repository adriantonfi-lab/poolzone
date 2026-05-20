export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WalletClient from './WalletClient'

export default async function WalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, transactionsRes, battlesRes, oracleRes] = await Promise.all([
    supabase.from('profiles').select('username, credits, avatar_url, inscription_status, inscription_fee').eq('id', user.id).single(),
    supabase.from('credit_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('battle_participants').select('*').eq('user_id', user.id),
    supabase.from('oracle_queries').select('cost, created_at').eq('user_id', user.id),
  ])

  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact' })

  return (
    <WalletClient
      profile={profileRes.data}
      transactions={transactionsRes.data || []}
      battlesCount={battlesRes.data?.length || 0}
      oracleSpent={oracleRes.data?.reduce((s: number, q: any) => s + (q.cost || 0), 0) || 0}
      estimatedPot={(totalUsers || 0) * 25}
    />
  )
}
