'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, Users, Zap, Shield, ChevronDown, DollarSign, Star, Globe } from 'lucide-react'

function useCountdown(target: string) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    function calc() {
      const diff = new Date(target).getTime() - Date.now()
      if (diff <= 0) return
      setT({ d: Math.floor(diff/86400000), h: Math.floor((diff%86400000)/3600000), m: Math.floor((diff%3600000)/60000), s: Math.floor((diff%60000)/1000) })
    }
    calc(); const id = setInterval(calc, 1000); return () => clearInterval(id)
  }, [target])
  return t
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '12px' }}>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>{q}</span>
        <ChevronDown size={18} color="#00C896" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>
      {open && <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, paddingBottom: '16px', margin: 0 }}>{a}</p>}
    </div>
  )
}

const FAQS_ES = [
  { q: '¿Cuánto cuesta inscribirse?', a: '$30 por persona. Pago único para todo el Mundial.' },
  { q: '¿Cómo cobro si gano?', a: 'Pagamos por Zelle (USA), Wise (internacional) o PayPal. Dentro de las 48hs de terminado el torneo.' },
  { q: '¿Cuándo cierra la inscripción?', a: 'Podés inscribirte hasta el inicio del primer partido el 11 de junio.' },
  { q: '¿Puedo cambiar mis predicciones?', a: 'Sí, pero cambiar con menos de 24hs antes del partido tiene un cargo pequeño ($2-5) que va al pozo.' },
  { q: '¿Qué es el Oráculo IA?', a: 'Nuestro Oráculo de IA te da análisis y predicciones. 12 consultas gratis incluidas.' },
  { q: '¿Es legal?', a: 'PoolZone es un juego de habilidad y predicción para entretenimiento entre amigos y familia.' },
]

const FAQS_EN = [
  { q: 'How much does it cost to join?', a: '$30 per person. One-time payment for the entire World Cup.' },
  { q: 'How do I get paid if I win?', a: 'We pay via Zelle (USA), Wise (international), or PayPal. Within 48 hours after the tournament ends.' },
  { q: 'When is the deadline to join?', a: 'You can join up to the start of the first match on June 11.' },
  { q: 'Can I change my predictions?', a: 'Yes, but changing less than 24 hours before kickoff incurs a small fee ($2-5) that goes to the prize pool.' },
  { q: 'What is the AI Oracle?', a: 'Our AI Oracle gives you match insights to help you make better picks. 12 free queries included.' },
  { q: 'Is this legal?', a: 'PoolZone is a skill-based prediction game for entertainment among friends and family.' },
]

const TARGET = '2026-06-11T19:00:00Z'

export default function LandingPage() {
  const [lang, setLang] = useState<'en'|'es'>('es')
  const [players, setPlayers] = useState(0)
  const cd = useCountdown(TARGET)
  const es = lang === 'es'
  const faqs = es ? FAQS_ES : FAQS_EN

  useEffect(() => {
    fetch('/api/game/stats').then(r => r.json()).then(d => setPlayers(d.players || 0)).catch(() => {})
  }, [])

  const cdItems = [
    { v: cd.d, l: es ? 'DÍAS' : 'DAYS' },
    { v: cd.h, l: 'HRS' },
    { v: cd.m, l: 'MIN' },
    { v: cd.s, l: es ? 'SEG' : 'SEC' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D1A', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, background: 'rgba(13,13,26,0.97)', backdropFilter: 'blur(12px)', zIndex: 50 }}>
        <img src="/poolzone-logo.png" alt="PoolZone" style={{ height: '40px', objectFit: 'contain' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setLang(lang === 'en' ? 'es' : 'en')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontWeight: 700, fontSize: '13px', padding: '6px 12px', borderRadius: '10px', cursor: 'pointer' }}>
            <Globe size={14} />{lang === 'en' ? 'ES' : 'EN'}
          </button>
          <Link href="/login" style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>{es ? 'Iniciar sesión' : 'Sign In'}</Link>
          <Link href="/register" style={{ background: '#00C896', color: 'black', fontWeight: 800, padding: '8px 18px', borderRadius: '12px', fontSize: '14px', textDecoration: 'none' }}>{es ? 'Únete' : 'Join Now'}</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>

        {/* BANNER */}
        <div style={{ margin: '32px 0 36px', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(0,200,150,0.15)', boxShadow: '0 0 60px rgba(0,200,150,0.08)' }}>
          <img src="/poolzone-banner.png" alt="PoolZone World Cup 2026" style={{ width: '100%', display: 'block' }} />
        </div>

        {/* COUNTDOWN */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#00C896', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>
            {es ? 'El Mundial Arranca En' : 'World Cup Kicks Off In'}
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
            {es ? '11 Jun · 3:00 PM ET · Estadio Azteca' : 'Jun 11 · 3:00 PM ET · Estadio Azteca'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            {cdItems.map(({ v, l }, i) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {i > 0 && <span style={{ color: '#00C896', fontSize: '40px', fontWeight: 900, lineHeight: 1, paddingBottom: '22px' }}>:</span>}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    background: 'rgba(0,0,0,0.6)',
                    border: '2px solid rgba(0,200,150,0.4)',
                    borderRadius: '16px',
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '38px', fontWeight: 900, color: '#00C896', display: 'block', width: '2ch', textAlign: 'center', lineHeight: 1 }}>
                      {String(v).padStart(2, '0')}
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '2px', marginTop: '8px', display: 'block' }}>{l}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          {players > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)', borderRadius: '100px', padding: '6px 16px', marginBottom: '20px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00C896', display: 'inline-block' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#00C896' }}>{players} {es ? 'jugadores inscriptos' : 'players joined'}</span>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#00C896', color: 'black', fontWeight: 900, fontSize: '20px', padding: '18px 48px', borderRadius: '18px', textDecoration: 'none' }}>
              {es ? 'Únete al Pozo — $30' : 'Join the Pool — $30'} →
            </Link>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              {es ? '$30 de inscripción · Pagos seguros · Premios reales' : '$30 entry · Secure payments · Real prizes'}
            </p>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '30px', fontWeight: 900, marginBottom: '6px' }}>{es ? 'Cómo Funciona' : 'How It Works'}</h2>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>{es ? 'Simple. Divertido. Dinero real.' : 'Simple. Fun. Real money.'}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {[
              { icon: <DollarSign size={28} color="#00C896" />, title: es ? 'Inscribite por $30' : 'Join for $30', desc: es ? 'Un pago. Jugás todos los 104 partidos del Mundial.' : "One payment. You're in for all 104 World Cup matches." },
              { icon: <Star size={28} color="#FFD700" />, title: es ? 'Predecí los Partidos' : 'Predict Matches', desc: es ? 'Elegí ganadores, marcadores exactos, goles por tiempo.' : 'Pick winners, exact scores, goal times. More detail = more points.' },
              { icon: <Trophy size={28} color="#FFD700" />, title: es ? 'Ganá Dinero Real' : 'Win Real Money', desc: es ? 'Los 3 primeros se reparten el pozo. 1° lleva 60%.' : 'Top 3 split the pot. 1st gets 60%, 2nd 30%, 3rd 10%.' },
            ].map(({ icon, title, desc }, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px 20px', textAlign: 'center' }}>
                <div style={{ marginBottom: '14px' }}>{icon}</div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '8px' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PRIZES */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '30px', fontWeight: 900, marginBottom: '32px' }}>{es ? 'Distribución de Premios' : 'Prize Distribution'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {[
              { place: es ? '1° Lugar' : '1st Place', pct: '60%', color: '#FFD700', border: 'rgba(255,215,0,0.25)' },
              { place: es ? '2° Lugar' : '2nd Place', pct: '30%', color: '#C0C0C0', border: 'rgba(192,192,192,0.15)' },
              { place: es ? '3° Lugar' : '3rd Place', pct: '10%', color: '#CD7F32', border: 'rgba(205,127,50,0.15)' },
            ].map(({ place, pct, color, border }) => (
              <div key={place} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${border}`, borderRadius: '20px', padding: '24px 12px', textAlign: 'center' }}>
                <Trophy size={24} color={color} style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: '36px', fontWeight: 900, color }}>{pct}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{place}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '60px' }}>
          {[
            { icon: <Users size={20} color="#00C896" />, title: es ? 'Para Familias y Amigos' : 'For Families & Friends', desc: es ? 'Jugá con tu gente. Hecho para la comunidad latina en USA.' : 'Play with your crew. Made for the Latino community in USA.' },
            { icon: <Shield size={20} color="#00C896" />, title: es ? 'Seguro y Transparente' : 'Safe & Transparent', desc: es ? 'Cada pago registrado. El pozo visible para todos.' : 'Every payment tracked. Prize pot visible to all players.' },
            { icon: <Zap size={20} color="#00C896" />, title: es ? 'Actualizaciones en Vivo' : 'Live Updates', desc: es ? 'Resultados en tiempo real. Notificaciones por cada gol.' : 'Real-time scores. Push notifications for every goal.' },
          ].map(({ icon, title, desc }, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '18px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(0,200,150,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 4px' }}>{title}</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55, margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '30px', fontWeight: 900, marginBottom: '32px' }}>{es ? 'Preguntas Frecuentes' : 'FAQ'}</h2>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '8px 24px' }}>
            {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>

        {/* FINAL CTA */}
        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '60px 0 40px' }}>
          <h2 style={{ fontSize: '38px', fontWeight: 900, marginBottom: '12px' }}>{es ? '¡No Te Quedés Afuera!' : "Don't Miss Out!"}</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '32px', fontSize: '16px' }}>
            {es ? 'El Mundial arranca el 11 de junio. Inscribite ahora y competí por premios reales.' : 'The World Cup starts June 11. Join now and compete for real prizes.'}
          </p>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#00C896', color: 'black', fontWeight: 900, fontSize: '20px', padding: '20px 52px', borderRadius: '20px', textDecoration: 'none' }}>
            {es ? 'Únete por $30' : 'Join Now for $30'} →
          </Link>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '20px' }}>poolzone.app · World Cup 2026</p>
        </div>

      </div>
    </div>
  )
}
