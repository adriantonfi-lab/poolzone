'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trophy, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // Load saved email
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    const savedRemember = localStorage.getItem('rememberMe') === 'true'
    if (savedRemember && savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Save o borrar email según checkbox
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email)
      localStorage.setItem('rememberMe', 'true')
    } else {
      localStorage.removeItem('rememberedEmail')
      localStorage.removeItem('rememberMe')
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Credenciales incorrectas. Revisá el email y contraseña.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-dvh bg-[#080812] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00C896]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7C3AED]/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00C896]/10 border border-[#00C896]/20 mb-4">
            <Trophy size={32} className="text-[#00C896]" />
          </div>
          <h1 className="font-sans text-4xl text-[#00C896] tracking-wider">POOLZONE</h1>
          <p className="text-gray-400 text-sm mt-1">WORLD CUP 2026</p>
        </div>

        <div className="bg-[#0D0D1A] border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-6">Sign in to your account</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* autocomplete="off" en el form y en cada input para evitar que el browser autocomplete */}
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete="off"
                name="email-login"
                className="w-full bg-[#080812] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00C896] text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  name="password-login"
                  className="w-full bg-[#080812] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-[#00C896] text-base"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Recordarme */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${rememberMe ? 'bg-[#00C896] border-[#00C896]' : 'border-white/10 bg-[#080812]'}`}
                >
                  {rememberMe && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-400">Remember my email</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-[#00C896] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00C896] text-black font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-base"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" />Ingresando...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            Don't have an account? <Link href="/register" className="text-[#00C896] hover:underline font-medium">Sign up here</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">World Cup 2026 Prediction Pool 🤣</p>
      </div>
    </div>
  )
}
