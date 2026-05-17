export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('id', user.id)
    .single()

  if (!profile || !['super_admin', 'admin'].includes(profile.role || '')) {
    redirect('/dashboard')
  }

  const [usersRes, matchesRes, predictionsRes] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('matches').select('*').order('match_date', { ascending: true }),
    supabase.from('predictions').select('*'),
  ])

  return (
    <AdminClient
      currentUser={{ id: user.id, role: profile.role || '', username: profile.username || '' }}
      users={usersRes.data || []}
      matches={matchesRes.data || []}
      predictions={predictionsRes.data || []}
    />
  )
}
