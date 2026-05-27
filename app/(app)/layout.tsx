'use client'
import './globals.css'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Calendar, Zap, MessageCircle, Sparkles, Wallet, LogOut, Trophy, BarChart2, Shield, DollarSign, Eye, BookOpen, GitBranch, LayoutGrid } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import LanguageSwitcher from '@/app/components/LanguageSwitcher'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/my-picks', label: 'My Picks', icon: Trophy },
  { href: '/leaderboard', label: 'Leaderboard', icon: BarChart2 },
  { href: '/challenges', label: 'Challenges', icon: Zap },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/ai-picks', label: 'Oracle', icon: Sparkles },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/join', label: 'Join', icon: DollarSign },
  { href: '/grupos', label: 'Groups', icon: LayoutGrid },
  { href: '/bracket', label: 'Bracket', icon: GitBranch },
  { href: '/how-to-play', label: 'Rules', icon: BookOpen },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.role === 'super_admin' || data?.role === 'admin') setIsAdmin(true)
          if (data?.role === 'super_admin') setIsSuperAdmin(true)
        })
    })
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-dvh flex bg-[#080812]" suppressHydrationWarning>
      <aside className="hidden md:flex flex-col w-56 bg-[#0D0D1A] border-r border-white/10 fixed h-full z-40">
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-1">
            <p className="font-bebas text-2xl text-[#00C896] tracking-wider">POOLZONE</p>
            <LanguageSwitcher />
          </div>
          <p className="text-xs text-gray-500">WORLD CUP 2026</p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === href
                  ? 'bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20'
                  : 'text-gray-400 hover:text-[#00C896] hover:bg-[#00C896]/10'
              }`}>
              <Icon size={18} />
              {label}
              {pathname === href && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00C896]" />}
            </Link>
          ))}
        </nav>
        {isAdmin && (
          <Link href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 mx-2 mb-1 rounded-xl text-sm font-medium transition-all ${
              pathname === '/admin'
                ? 'bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20'
                : 'text-gray-400 hover:text-[#00C896] hover:bg-[#00C896]/10'
            }`}>
            <Shield size={18} />
            Admin
            {pathname === '/admin' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00C896]" />}
          </Link>
        )}
        {isSuperAdmin && (
          <Link href="/superadmin"
            className={`flex items-center gap-3 px-3 py-2.5 mx-2 mb-1 rounded-xl text-sm font-medium transition-all ${
              pathname === '/superadmin'
                ? 'bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20'
                : 'text-gray-400 hover:text-[#00C896] hover:bg-[#00C896]/10'
            }`}>
            <Eye size={18} />
            Super Admin
            {pathname === '/superadmin' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00C896]" />}
          </Link>
        )}
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 mx-2 mb-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-all border-t-0 mt-1">
          <LogOut size={16} />
          Sign Out
        </button>
      </aside>

      <main className="flex-1 md:ml-56 pb-20 md:pb-0 min-w-0">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0D0D1A] border-t border-white/10 z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all ${
                pathname === href ? 'text-[#00C896]' : 'text-gray-500'
              }`}>
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
