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
  { href: '/schedule', label: 'Fixture', icon: Calendar },
  { href: '/my-picks', label: 'Mi Polla', icon: Trophy },
  { href: '/leaderboard', label: 'Ranking', icon: BarChart2 },
  { href: '/challenges', label: 'Batallas', icon: Zap },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/ai-picks', label: 'Oráculo', icon: Sparkles },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/join', label: 'Inscripción', icon: DollarSign },
  { href: '/grupos', label: 'Grupos', icon: LayoutGrid },
  { href: '/bracket', label: 'Eliminatorias', icon: GitBranch },
  { href: '/how-to-play', label: 'Reglas', icon: BookOpen },
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
    <div className="min-h-dvh flex bg-[#0D0D0D]" suppressHydrationWarning>
      <aside className="hidden md:flex flex-col w-56 bg-[#1A1A2E] border-r border-[#2A2A4A] fixed h-full z-40">
        <div className="px-4 py-4 border-b border-[#2A2A4A]">
          <div className="flex items-center justify-between mb-1">
            <p className="font-bebas text-2xl text-[#FFD700] tracking-wider">CHE-BACANO</p>
            <LanguageSwitcher />
          </div>
          <p className="text-xs text-gray-500">MUNDIAL 2026</p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === href
                  ? 'bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20'
                  : 'text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10'
              }`}>
              <Icon size={18} />
              {label}
              {pathname === href && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FFD700]" />}
            </Link>
          ))}
        </nav>
        {isAdmin && (
          <Link href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 mx-2 mb-1 rounded-xl text-sm font-medium transition-all ${
              pathname === '/admin'
                ? 'bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20'
                : 'text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10'
            }`}>
            <Shield size={18} />
            Administrador
            {pathname === '/admin' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FFD700]" />}
          </Link>
        )}
        {isSuperAdmin && (
          <Link href="/superadmin"
            className={`flex items-center gap-3 px-3 py-2.5 mx-2 mb-1 rounded-xl text-sm font-medium transition-all ${
              pathname === '/superadmin'
                ? 'bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20'
                : 'text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10'
            }`}>
            <Eye size={18} />
            Super Administrador
            {pathname === '/superadmin' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FFD700]" />}
          </Link>
        )}
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 mx-2 mb-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-all border-t-0 mt-1">
          <LogOut size={16} />
          Salir
        </button>
      </aside>

      <main className="flex-1 md:ml-56 pb-20 md:pb-0 min-w-0">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A2E] border-t border-[#2A2A4A] z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all ${
                pathname === href ? 'text-[#FFD700]' : 'text-gray-500'
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
