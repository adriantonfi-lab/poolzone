'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trophy, Eye, EyeOff, Loader2, Camera, Check } from 'lucide-react'

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
  { code: 'FR', name: 'Francia' },
  { code: 'DE', name: 'Alemania' },
  { code: 'IT', name: 'Italia' },
  { code: 'CA', name: 'Canadá' },
  { code: 'OTHER', name: 'Otro' },
]

const TEAMS = [
  // CONMEBOL
  'Argentina', 'Brasil', 'Uruguay', 'Colombia', 'Ecuador',
  'Paraguay', 'Venezuela', 'Bolivia', 'Perú', 'Chile',
  // CONCACAF
  'Estados Unidos', 'México', 'Canadá', 'Costa Rica', 'Panamá',
  'Honduras', 'Jamaica', 'Guatemala', 'Trinidad y Tobago', 'El Salvador',
  'Cuba', 'Haití',
  // UEFA
  'España', 'Francia', 'Alemania', 'Portugal', 'Inglaterra',
  'Países Bajos', 'Bélgica', 'Italia', 'Croacia', 'Serbia',
  'Suiza', 'Dinamarca', 'Austria', 'Escocia', 'Hungría',
  'Eslovenia', 'Rumania', 'Albania', 'Turquía', 'Eslovaquia',
  'República Checa', 'Georgia', 'Polonia', 'Ucrania', 'Grecia',
  // CAF
  'Marruecos', 'Senegal', 'Egipto', 'Nigeria', 'Camerún',
  'Costa de Marfil', 'Ghana', 'Mali', 'Sudáfrica', 'Argelia',
  'Túnez', 'Guinea',
  // AFC
  'Japón', 'Corea del Sur', 'Arabia Saudita', 'Australia', 'Irán',
  'Qatar', 'Iraq', 'Uzbekistán', 'Jordania', 'Omán',
  // OFC
  'Nueva Zelanda',
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
      if (!ctx) {
        reject(new Error('No se pudo obtener el contexto del canvas'))
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }))
          } else {
            reject(new Error('Error al comprimir la imagen'))
          }
        },
        'image/jpeg',
        0.8
      )
    }
    img.onerror = () => reject(new Error('Error al cargar la imagen'))
    img.src = URL.createObjectURL(file)
  })
}

export default function RegisterPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [country, setCountry] = useState('')
  const [favoriteTeam, setFavoriteTeam] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [compressing, setCompressing] = useState(false)

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
      setError('No se pudo procesar la imagen. Probá con otra foto.')
    } finally {
      setCompressing(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step === 1) { setStep(2); return }
    if (!avatarFile) { setError('La foto es obligatoria'); return }
    if (!country || !favoriteTeam) { setError('Seleccioná tu país y equipo'); return }

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    formData.append('username', username.toLowerCase().replace(/[^a-z0-9_]/g, ''))
    formData.append('fullName', fullName)
    formData.append('country', country)
    formData.append('favoriteTeam', favoriteTeam)
    formData.append('avatar', avatarFile)

    try {
      const res = await fetch('/api/register', { method: 'POST', body: formData })
      let data
      try {
        data = await res.json()
      } catch {
        setError('Error del servidor. Intentá de nuevo.')
        setLoading(false)
        return
      }
      if (!res.ok) {
        setError(data.error || 'Error al registrarse')
        setLoading(false)
        return
      }
      router.push('/login')
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Trophy size={40} className="text-[#FFD700] mx-auto mb-3" />
          <h1 className="font-bebas text-4xl text-white tracking-wider">CHE-BACANO</h1>
          <p className="text-gray-400 mt-1">Creá tu cuenta mundialera</p>
        </div>

        <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-6">
          <div className="flex gap-2 mb-6">
            <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-[#FFD700]' : 'bg-[#2A2A4A]'}`} />
            <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-[#FFD700]' : 'bg-[#2A2A4A]'}`} />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">Email *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com"
                    className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-[#FFD700]" />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">Usuario *</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} required minLength={3} placeholder="tu_usuario"
                    className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-[#FFD700]" />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">Nombre completo</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Tu nombre"
                    className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-[#FFD700]" />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">Contraseña *</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres"
                      className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-3 pr-12 text-white text-base focus:outline-none focus:border-[#FFD700]" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold py-3 rounded-xl text-base">
                  Siguiente →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">Foto de perfil *</label>
                  <div onClick={() => !compressing && fileRef.current?.click()}
                    className="relative cursor-pointer flex flex-col items-center justify-center h-32 border-2 border-dashed border-[#2A2A4A] hover:border-[#FFD700]/50 rounded-xl overflow-hidden">
                    {compressing ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 size={24} className="text-[#FFD700] animate-spin" />
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
                        <p className="text-gray-400 text-base">Tocá para subir tu foto</p>
                        <p className="text-gray-600 text-sm mt-1">Se comprime automáticamente</p>
                      </>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">Tu país *</label>
                  <select value={country} onChange={e => setCountry(e.target.value)} required
                    className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-[#FFD700]">
                    <option value="">Seleccioná tu país</option>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">Equipo del corazón *</label>
                  <select value={favoriteTeam} onChange={e => setFavoriteTeam(e.target.value)} required
                    className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-[#FFD700]">
                    <option value="">¿A quién bancás?</option>
                    {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 bg-[#0D0D0D] border border-[#2A2A4A] text-gray-300 font-medium py-3 rounded-xl text-base">
                    ← Atrás
                  </button>
                  <button type="submit" disabled={loading || compressing}
                    className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold py-3 rounded-xl text-base disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : '¡A jugar!'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            ¿Ya tenés cuenta? <Link href="/login" className="text-[#FFD700] hover:underline font-medium">Entrá acá</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
