'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trophy, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (resetError) {
      setError('No pudimos enviar el email. Revisá que el email sea correcto.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
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

          {sent ? (
            /* Estado: email enviado */
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Email sent!</h2>
              <p className="text-gray-400 text-sm mb-6">
                Te mandamos un link a <span className="text-white font-medium">{email}</span> para resetear tu contraseña. Revisá también el spam.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 text-[#00C896] hover:underline text-sm font-medium">
                <ArrowLeft size={16} />
                Back al login
              </Link>
            </div>
          ) : (
            /* Estado: formulario */
            <>
              <h2 className="text-xl font-semibold text-white mb-1">Forgot password?</h2>
              <p className="text-gray-400 text-sm mb-6">
                Sign in tu email y te mandamos un link para resetearla.
              </p>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    autoComplete="off"
                    className="w-full bg-[#080812] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00C896] text-base"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#00C896] to-[#00b085] text-black font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-base"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" />Enviando...</> : 'Mandar link de reset'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-5">
                <Link href="/login" className="inline-flex items-center gap-1 text-[#00C896] hover:underline font-medium">
                  <ArrowLeft size={14} />
                  Back al login
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">La app de apuestas del grupo familiar 🤣</p>
      </div>
    </div>
  )
}
