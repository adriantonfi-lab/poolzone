'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LanguageSwitcher() {
  const router = useRouter()
  const [locale, setLocale] = useState('es')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const match = document.cookie.match(/locale=([^;]+)/)
    if (match) setLocale(match[1])
  }, [])

  function toggle() {
    const next = locale === 'es' ? 'en' : 'es'
    document.cookie = `locale=${next}; path=/; max-age=31536000`
    setLocale(next)
    router.refresh()
  }

  if (!mounted) return (
    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D0D1A] border border-white/10 rounded-xl text-sm font-bold text-white">
      🇦🇷 ES
    </button>
  )

  return (
    <button onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D0D1A] border border-white/10 rounded-xl text-sm font-bold text-white hover:border-[#00C896] transition-all">
      {locale === 'es' ? '🇦🇷 ES' : '🇺🇸 EN'}
    </button>
  )
}
