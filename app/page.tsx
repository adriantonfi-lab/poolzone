'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, Users, Zap, Shield, Star, ChevronRight, DollarSign } from 'lucide-react'

const TEXTS = {
  en: {
    nav_signin: 'Sign In',
    nav_join: 'Join Now',
    countdown_label: 'World Cup Kicks Off In',
    days: 'DAYS', hrs: 'HRS', min: 'MIN', sec: 'SEC',
    pot_label: 'Prize Pool',
    pot_sub: 'Growing every day · Paid out to top 3 players',
    cta_join: 'Join the Pool — $30',
    cta_how: 'How It Works',
    cta_sub: '$30 entry · 60% goes to 1st place · Secure payments',
    how_title: 'How It Works',
    how_sub: 'Simple. Fun. Real prizes.',
    step1_title: 'Join for $30',
    step1_desc: "Pay once and you're in for the entire World Cup. All 104 matches.",
    step2_title: 'Predict Matches',
    step2_desc: 'Pick winners, exact scores, and goal times. More detail = more points.',
    step3_title: 'Win Real Money',
    step3_desc: 'Top 3 players split the pot. 1st gets 60%, 2nd 30%, 3rd 10%.',
    prizes_title: 'Prize Distribution',
    prize1: '1st Place', prize2: '2nd Place', prize3: '3rd Place',
    features: [
      { title: 'For Families & Friends', desc: 'Play with your crew. Latino community in USA.' },
      { title: 'Safe & Transparent', desc: 'Every payment tracked. Prize visible to all players.' },
      { title: 'Live Updates', desc: 'Real-time scores. Push notifications for every goal.' },
    ],
    final_title: 'Ready to Play?',
    final_sub: 'Join hundreds of players competing for real prizes this World Cup.',
    final_cta: 'Join Now for $30',
  },
  es: {
    nav_signin: 'Iniciar sesión',
    nav_join: 'Únete',
    countdown_label: 'El Mundial Arranca En',
    days: 'DÍAS', hrs: 'HRS', min: 'MIN', sec: 'SEG',
    pot_label: 'Pozo de Premios',
    pot_sub: 'Crece cada día · Se reparte entre los 3 primeros',
    cta_join: 'Únete al Pozo — $30',
    cta_how: 'Cómo Funciona',
    cta_sub: '$30 de inscripción · 60% para el 1° · Pagos seguros',
    how_title: 'Cómo Funciona',
    how_sub: 'Simple. Divertido. Premios reales.',
    step1_title: 'Inscribite por $30',
    step1_desc: 'Un solo pago y jugás todo el Mundial. Los 104 partidos.',
    step2_title: 'Predecí los Partidos',
    step2_desc: 'Elegí ganadores, marcadores exactos y goles por tiempo. Más detalle = más puntos.',
    step3_title: 'Ganá Dinero Real',
    step3_desc: 'Los 3 primeros se reparten el pozo. 1° lleva 60%, 2° 30%, 3° 10%.',
    prizes_title: 'Distribución de Premios',
    prize1: '1° Lugar', prize2: '2° Lugar', prize3: '3° Lugar',
    features: [
      { title: 'Para Familias y Amigos', desc: 'Jugá con tu gente. Comunidad latina en USA.' },
      { title: 'Seguro y Transparente', desc: 'Cada pago registrado. El pozo visible para todos.' },
      { title: 'Actualizaciones en Vivo', desc: 'Resultados en tiempo real. Notificaciones por cada gol.' },
    ],
    final_title: '¿Listo para Jugar?',
    final_sub: 'Sumate a cientos de jugadores compitiendo por premios reales en este Mundial.',
    final_cta: 'Únete por $30',
  }
}

function useCountdown(targetDate: string) {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) { setT({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return }
      setT({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return t
}

function ClockBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div style={{
        width: '80px',
        height: '80px',
        background: 'rgba(0,0,0,0.5)',
        border: '2px solid rgba(0,200,150,0.4)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'monospace',
          fontSize: '36px',
          fontWeight: '900',
          color: '#00C896',
          lineHeight: 1,
          display: 'block',
          width: '2ch',
          textAlign: 'center',
        }}>
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginTop: '6px', letterSpacing: '2px' }}>
        {label}
      </span>
    </div>
  )
}

export default function LandingPage() {
  const [lang, setLang] = useState<'en' | 'es'>('es')
  const t = TEXTS[lang]
  const clock = useCountdown('2026-06-11T20:00:00Z')

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D1A', color: 'white', fontFamily: 'system-ui, sans-serif' }}>

      {/* NAV */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky', top: 0, background: 'rgba(13,13,26,0.95)',
        backdropFilter: 'blur(10px)', zIndex: 50,
      }}>
        <img src="/poolzone-logo.png" alt="PoolZone" style={{ height: '44px', objectFit: 'contain' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'white', fontWeight: 700, fontSize: '13px',
              padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
            }}>
            {lang === 'en' ? '🇲🇽 ES' : '🇺🇸 EN'}
          </button>
          <Link href="/login" style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
            {t.nav_signin}
          </Link>
          <Link href="/register" style={{
            background: '#00C896', color: 'black', fontWeight: 800,
            padding: '8px 18px', borderRadius: '12px', fontSize: '14px', textDecoration: 'none',
          }}>
            {t.nav_join}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px 0', textAlign: 'center' }}>

        {/* BANNER */}
        <div style={{ borderRadius: '20px', overflow: 'hidden', marginBottom: '40px', border: '1px solid rgba(0,200,150,0.2)' }}>
          <img src="/poolzone-banner.png" alt="PoolZone World Cup 2026"
            style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: '420px' }} />
        </div>

        {/* COUNTDOWN */}
        <p style={{ color: '#00C896', fontWeight: 700, fontSize: '13px', letterSpacing: '3px', marginBottom: '20px', textTransform: 'uppercase' }}>
          {t.countdown_label}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '40px' }}>
          <ClockBox value={clock.days} label={t.days} />
          <span style={{ color: '#00C896', fontSize: '36px', fontWeight: 900, marginBottom: '20px' }}>:</span>
          <ClockBox value={clock.hours} label={t.hrs} />
          <span style={{ color: '#00C896', fontSize: '36px', fontWeight: 900, marginBottom: '20px' }}>:</span>
          <ClockBox value={clock.minutes} label={t.min} />
          <span style={{ color: '#00C896', fontSize: '36px', fontWeight: 900, marginBottom: '20px' }}>:</span>
          <ClockBox value={clock.seconds} label={t.sec} />
        </div>

        {/* POT */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(0,200,150,0.08))',
          border: '1px solid rgba(255,215,0,0.25)',
          borderRadius: '24px', padding: '32px', marginBottom: '36px', display: 'inline-block', minWidth: '300px',
        }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>
            {t.pot_label}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
            <Trophy size={32} color="#FFD700" />
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#FFD700' }}>Real Money Prizes</span>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{t.pot_sub}</p>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Link href="/register" style={{
            background: '#00C896', color: 'black', fontWeight: 900,
            fontSize: '18px', padding: '18px 40px', borderRadius: '16px',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px',
          }}>
            {t.cta_join} →
          </Link>
          <Link href="/how-to-play" style={{
            border: '2px solid rgba(255,255,255,0.15)', color: 'white', fontWeight: 700,
            fontSize: '16px', padding: '14px 32px', borderRadius: '16px', textDecoration: 'none',
          }}>
            {t.cta_how}
          </Link>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '60px' }}>{t.cta_sub}</p>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 20px 60px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>{t.how_title}</h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginBottom: '40px' }}>{t.how_sub}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {[
            { icon: <DollarSign size={32} color="#00C896" />, title: t.step1_title, desc: t.step1_desc },
            { icon: <Star size={32} color="#FFD700" />, title: t.step2_title, desc: t.step2_desc },
            { icon: <Trophy size={32} color="#FFD700" />, title: t.step3_title, desc: t.step3_desc },
          ].map(({icon, title, desc}, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px', padding: '28px', textAlign: 'center',
            }}>
              <div style={{ marginBottom: '16px' }}>{icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>{title}</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PRIZES */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 20px 60px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 900, marginBottom: '40px' }}>{t.prizes_title}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { place: t.prize1, pct: '60%', color: '#FFD700', border: 'rgba(255,215,0,0.3)' },
            { place: t.prize2, pct: '30%', color: '#C0C0C0', border: 'rgba(192,192,192,0.2)' },
            { place: t.prize3, pct: '10%', color: '#CD7F32', border: 'rgba(205,127,50,0.2)' },
          ].map(({place, pct, color, border}) => (
            <div key={place} style={{
              background: `rgba(255,255,255,0.02)`, border: `1px solid ${border}`,
              borderRadius: '20px', padding: '28px', textAlign: 'center',
            }}>
              <Trophy size={28} color={color} style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '36px', fontWeight: 900, color }}>{pct}</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{place}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 20px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {t.features.map(({title, desc}, i) => (
            <div key={i} style={{
              display: 'flex', gap: '14px', alignItems: 'flex-start',
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px', padding: '20px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'rgba(0,200,150,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {i === 0 ? <Users size={20} color="#00C896" /> : i === 1 ? <Shield size={20} color="#00C896" /> : <Zap size={20} color="#00C896" />}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{title}</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <div style={{
        maxWidth: '960px', margin: '0 auto', padding: '60px 20px',
        textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <h2 style={{ fontSize: '40px', fontWeight: 900, marginBottom: '12px' }}>{t.final_title}</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '32px', fontSize: '16px' }}>{t.final_sub}</p>
        <Link href="/register" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: '#00C896', color: 'black', fontWeight: 900,
          fontSize: '20px', padding: '20px 48px', borderRadius: '20px', textDecoration: 'none',
        }}>
          {t.final_cta} →
        </Link>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '20px' }}>
          poolzone.app · World Cup 2026 · Secure Payments
        </p>
      </div>

    </div>
  )
}
