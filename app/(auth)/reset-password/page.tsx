'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Supabase redirige acá con el token en el hash de la URL
    // El cliente de Supabase lo maneja automáticamente
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Listo para resetear
      }
    })
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError('No se pudo actualizar la contraseña. El link puede haber expirado.')
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => router.push('/dashboard'), 3000)
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
          <p className="text-gray-400 text-sm mt-1">WORLD CUP 2026 🏆</p>
        </div>

        <div className="bg-[#0D0D1A] border border-white/10 rounded-2xl p-6">

          {done ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Password updated!</h2>
              <p className="text-gray-400 text-sm">Te redirigimos al dashboard en unos segundos...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-1">Nueva contraseña</h2>
              <p className="text-gray-400 text-sm mb-6">Elegí una contraseña nueva para tu cuenta.</p>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4" autoComplete="off">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Nueva contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      className="w-full bg-[#080812] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-[#00C896] text-base"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirmar contraseña</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      className="w-full bg-[#080812] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-[#00C896] text-base"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#00C896] to-[#00b085] text-black font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-base"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" />Guardando...</> : 'Save nueva contraseña'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">La app de apuestas del grupo familiar 🤣</p>
      </div>
    </div>
  )
}
