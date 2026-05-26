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

  // Cargar email guardado si el usuario eligió recordar
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

    // Guardar o borrar email según checkbox
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
    <div className="min-h-dvh bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7C3AED]/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 mb-4">
            <Trophy size={32} className="text-[#FFD700]" />
          </div>
          <h1 className="font-bebas text-4xl text-[#FFD700] tracking-wider">POOLZONE</h1>
          <p className="text-gray-400 text-sm mt-1">WORLD CUP 2026 🏆</p>
        </div>

        <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-1">Bienvenido de vuelta</h2>
          <p className="text-gray-400 text-sm mb-6">Ingresá a tu cuenta para seguir la acción</p>

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
                className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700] text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  name="password-login"
                  className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700] text-base"
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
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${rememberMe ? 'bg-[#FFD700] border-[#FFD700]' : 'border-[#2A2A4A] bg-[#0D0D0D]'}`}
                >
                  {rememberMe && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-400">Recordar mi email</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-[#FFD700] hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-base"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" />Ingresando...</> : '¡Dale, entrá!'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            ¿No tenés cuenta? <Link href="/register" className="text-[#FFD700] hover:underline font-medium">Registrate acá</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">La app de apuestas del grupo familiar 🤣</p>
      </div>
    </div>
  )
}
