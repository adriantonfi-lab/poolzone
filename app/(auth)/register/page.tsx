'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trophy, Eye, EyeOff, Loader2, Camera, Check, CreditCard, Lock, Gift } from 'lucide-react'

const COUNTRIES = [
  { code: 'AR', name: 'Argentina' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'CO', name: 'Colombia' },
  { code: 'DO', name: 'República Dominicana' },
  { code: 'MX', name: 'México' },
  { code: 'BR', name: 'Brasil' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'PE', name: 'Perú' },
  { code: 'CL', name: 'Chile' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'PA', name: 'Panamá' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'HN', name: 'Honduras' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'CU', name: 'Cuba' },
  { code: 'ES', name: 'España' },
  { code: 'PT', name: 'Portugal' },
  { code: 'CA', name: 'Canadá' },
  { code: 'OTHER', name: 'Otro' },
]

const TEAMS = [
  'Argentina', 'Brasil', 'Uruguay', 'Colombia', 'Ecuador',
  'Paraguay', 'Venezuela', 'Bolivia', 'Perú', 'Chile',
  'Estados Unidos', 'México', 'Canadá', 'Costa Rica', 'Panamá',
  'Honduras', 'Jamaica', 'Haití',
  'España', 'Francia', 'Alemania', 'Portugal', 'Inglaterra',
  'Países Bajos', 'Bélgica', 'Croacia', 'Suiza', 'Austria',
  'Escocia', 'República Checa', 'Polonia', 'Turquía',
  'Marruecos', 'Senegal', 'Egipto', 'Nigeria', 'Camerún',
  'Costa de Marfil', 'Ghana', 'Mali', 'Sudáfrica', 'Argelia', 'Túnez',
  'Japón', 'Corea del Sur', 'Arabia Saudita', 'Australia', 'Irán',
  'Qatar', 'Irak', 'Uzbekistán', 'Jordania', 'Nueva Zelanda',
]

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const MAX = 400
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas error')); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => blob ? resolve(new File([blob], 'avatar.jpg', { type: 'image/jpeg' })) : reject(new Error('Blob error')),
        'image/jpeg', 0.8
      )
    }
    img.onerror = () => reject(new Error('Image load error'))
    img.src = URL.createObjectURL(file)
  })
}

export default function RegisterPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')

  // Step 2
  const [country, setCountry] = useState('')
  const [favoriteTeam, setFavoriteTeam] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [compressing, setCompressing] = useState(false)

  // Step 3 — Payment
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card')
  const [cardName, setCardName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCompressing(true)
    setError('')
    try {
      const compressed = await compressImage(file)
      setAvatarFile(compressed)
      setAvatarPreview(URL.createObjectURL(compressed))
    } catch {
      setError('No se pudo procesar la imagen.')
    } finally {
      setCompressing(false)
    }
  }

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password || !username) { setError('Completá todos los campos'); return }
    setError('')
    setStep(2)
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    if (!country || !favoriteTeam) { setError('Seleccioná tu país y equipo'); return }
    setError('')
    setStep(3)
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed) { setError('Aceptá los términos y condiciones'); return }

    setPaymentLoading(true)
    setError('')

    try {
      // 1. Crear cuenta primero
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)
      formData.append('username', username.toLowerCase().replace(/[^a-z0-9_]/g, ''))
      formData.append('fullName', fullName)
      formData.append('country', country)
      formData.append('favoriteTeam', favoriteTeam)
      if (avatarFile) formData.append('avatar', avatarFile)

      const regRes = await fetch('/api/register', { method: 'POST', body: formData })
      const regData = await regRes.json()

      if (!regRes.ok) {
        setError(regData.error || 'Error al crear la cuenta')
        setPaymentLoading(false)
        return
      }

      const userId = regData.userId

      // 2. Login automático
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = (await import('@/lib/supabase/client')).createClient()
      await supabase.auth.signInWithPassword({ email, password })

      // 3. Crear sesión de pago Stripe
      if (paymentMethod === 'card') {
        const stripeRes = await fetch('/api/payments/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, email }),
        })
        const stripeData = await stripeRes.json()

        if (stripeData.url) {
          window.location.href = stripeData.url
        } else {
          setError(stripeData.error || 'Error al procesar el pago')
          setPaymentLoading(false)
        }
      } else {
        // Transferencia manual
        router.push(`/join/transfer?userId=${userId}`)
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
      setPaymentLoading(false)
    }
  }

  const inputClass = "w-full bg-[#080812] border border-white/10 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-[#00C896]"

  return (
    <div className="min-h-dvh bg-[#0D0D1A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src="/poolzone-logo.png" alt="PoolZone" className="h-12 mx-auto mb-3 object-contain" />
          <p className="text-gray-400 text-sm">
            {step === 1 ? 'Creá tu cuenta' : step === 2 ? 'Tu perfil' : 'Inscripción — $30'}
          </p>
        </div>

        <div className="bg-[#0D0D1A] border border-white/10 rounded-2xl p-6">
          {/* Progress */}
          <div className="flex gap-2 mb-6">
            {[1,2,3].map(s => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${step >= s ? 'bg-[#00C896]' : 'bg-[#2A2A4A]'}`} />
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Usuario *</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} required minLength={3} placeholder="tu_usuario" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre completo</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Tu nombre" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Contraseña *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" className={`${inputClass} pr-12`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full bg-[#00C896] text-black font-bold py-3 rounded-xl text-base">
                Siguiente →
              </button>
              <p className="text-center text-sm text-gray-400">
                ¿Ya tenés cuenta? <Link href="/login" className="text-[#00C896] hover:underline">Entrá acá</Link>
              </p>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Foto de perfil</label>
                <div onClick={() => !compressing && fileRef.current?.click()}
                  className="relative cursor-pointer flex flex-col items-center justify-center h-28 border-2 border-dashed border-white/10 hover:border-[#00C896]/50 rounded-xl overflow-hidden">
                  {compressing ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={24} className="text-[#00C896] animate-spin" />
                      <p className="text-gray-400 text-sm">Comprimiendo...</p>
                    </div>
                  ) : avatarPreview ? (
                    <>
                      <img src={avatarPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Check size={32} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera size={28} className="text-gray-500 mb-2" />
                      <p className="text-gray-400 text-sm">Tocá para subir tu foto</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Tu país *</label>
                <select value={country} onChange={e => setCountry(e.target.value)} required className={inputClass}>
                  <option value="">Seleccioná tu país</option>
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Equipo del corazón *</label>
                <select value={favoriteTeam} onChange={e => setFavoriteTeam(e.target.value)} required className={inputClass}>
                  <option value="">¿A quién bancás?</option>
                  {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-[#080812] border border-white/10 text-gray-300 font-medium py-3 rounded-xl text-base">
                  ← Atrás
                </button>
                <button type="submit" className="flex-1 bg-[#00C896] text-black font-bold py-3 rounded-xl text-base">
                  Siguiente →
                </button>
              </div>
            </form>
          )}

          {/* STEP 3 — PAYMENT */}
          {step === 3 && (
            <form onSubmit={handlePayment} className="space-y-4">

              {/* Resumen */}
              <div className="bg-[#080812] border border-[#00C896]/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-white">Inscripción Mundial 2026</span>
                  <span className="font-bold text-[#00C896] text-lg">$30</span>
                </div>
                <div className="flex items-center gap-2 bg-[#00C896]/10 border border-[#00C896]/20 rounded-lg px-3 py-2">
                  <Gift size={16} className="text-[#00C896] shrink-0" />
                  <p className="text-xs text-[#00C896] font-semibold">
                    Incluye $5 en créditos para usar en el Oráculo, modificaciones y batallas*
                  </p>
                </div>
              </div>

              {/* Método de pago */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Método de pago</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all ${paymentMethod === 'card' ? 'border-[#00C896] bg-[#00C896]/10 text-[#00C896]' : 'border-white/10 text-white'}`}>
                    <CreditCard size={16} />Tarjeta
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('transfer')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all ${paymentMethod === 'transfer' ? 'border-[#00C896] bg-[#00C896]/10 text-[#00C896]' : 'border-white/10 text-white'}`}>
                    💸 Transferencia
                  </button>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="bg-[#080812] border border-white/10 rounded-xl p-3 flex items-center gap-2">
                  <Lock size={14} className="text-[#00C896]" />
                  <p className="text-xs text-gray-400">Serás redirigido a Stripe — pago 100% seguro con SSL</p>
                </div>
              )}

              {paymentMethod === 'transfer' && (
                <div className="bg-[#080812] border border-white/10 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Pagarás por Zelle, Nequi o transferencia. Te daremos los datos en el próximo paso.</p>
                </div>
              )}

              {/* Términos */}
              <div className="flex items-start gap-3">
                <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  className="mt-1 accent-[#00C896]" />
                <label htmlFor="terms" className="text-xs text-gray-400 leading-relaxed cursor-pointer">
                  Acepto los <Link href="/terms" className="text-[#00C896] hover:underline">términos y condiciones</Link> de PoolZone. *Los créditos son exclusivos para uso dentro de la plataforma y no son canjeables por dinero.
                </label>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex-1 bg-[#080812] border border-white/10 text-gray-300 font-medium py-3 rounded-xl text-sm">
                  ← Atrás
                </button>
                <button type="submit" disabled={paymentLoading || !agreed}
                  className="flex-1 bg-[#00C896] text-black font-bold py-3 rounded-xl text-base disabled:opacity-40 flex items-center justify-center gap-2">
                  {paymentLoading
                    ? <><Loader2 size={16} className="animate-spin" />Procesando...</>
                    : paymentMethod === 'card' ? '💳 Pagar $30' : '💸 Continuar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
