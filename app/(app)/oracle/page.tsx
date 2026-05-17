'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Send, Loader2, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Message = { role: 'user' | 'oracle'; content: string }

const SUGGESTED_QUESTIONS = [
  '¿Quién tiene más chances de ganar el Grupo A?',
  '¿Argentina puede llegar a la final?',
  '¿Qué selección tiene el mejor ataque del torneo?',
  '¿Brasil vs Francia, quién gana y con qué marcador?',
  '¿Cuál es la selección más peligrosa del torneo?',
  '¿Qué equipos sorpresa pueden llegar lejos?',
]

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        setDone(true)
        clearInterval(interval)
      }
    }, 12)
    return () => clearInterval(interval)
  }, [text])

  const renderFormatted = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Título con ##
      if (line.startsWith('## ')) {
        return <p key={i} className="text-xl font-bebas text-[#FFD700] tracking-wider mt-3 mb-1">{line.replace('## ', '')}</p>
      }
      // Subtítulo con ###
      if (line.startsWith('### ')) {
        return <p key={i} className="text-base font-bold text-[#A855F7] mt-3 mb-1">{line.replace('### ', '')}</p>
      }
      // Línea con **bold**
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <p key={i} className="text-base text-white leading-relaxed mb-1">
            {parts.map((part, j) =>
              j % 2 === 1
                ? <span key={j} className="font-bold text-[#FFD700]">{part}</span>
                : part
            )}
          </p>
        )
      }
      // Línea con guión (lista)
      if (line.startsWith('- ')) {
        return <p key={i} className="text-base text-white leading-relaxed mb-1 pl-2">• {line.slice(2)}</p>
      }
      // Línea vacía
      if (line.trim() === '') return <div key={i} className="h-2" />
      // Línea normal
      return <p key={i} className="text-base text-white leading-relaxed mb-1">{line}</p>
    })
  }

  return (
    <div>
      {renderFormatted(displayed)}
      {!done && <span className="inline-block w-0.5 h-4 bg-[#A855F7] animate-pulse ml-0.5" />}
    </div>
  )
}

export default function OraclePage() {
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [queriesUsed, setQueriesUsed] = useState(0)
  const [loadingQueries, setLoadingQueries] = useState(true)
  const [limitReached, setLimitReached] = useState(false)
  const [lastOracleIndex, setLastOracleIndex] = useState(-1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const MAX_QUERIES = 12

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUser(user)
      supabase
        .from('oracle_queries')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .then(({ count }) => {
          const used = count || 0
          setQueriesUsed(used)
          setLimitReached(used >= MAX_QUERIES)
          setLoadingQueries(false)
        })
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleAsk(q?: string) {
    const text = q || question
    if (!text.trim() || loading || limitReached || !user) return

    setMessages(prev => [...prev, { role: 'user', content: text }])
    setQuestion('')
    setLoading(true)

    try {
      const res = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, userId: user.id }),
      })
      const data = await res.json()

      if (data.error === 'limite') {
        setLimitReached(true)
        setMessages(prev => {
          const next = [...prev, { role: 'oracle' as const, content: 'Has alcanzado el límite de consultas.' }]
          setLastOracleIndex(next.length - 1)
          return next
        })
      } else {
        setMessages(prev => {
          const next = [...prev, { role: 'oracle' as const, content: data.answer }]
          setLastOracleIndex(next.length - 1)
          return next
        })
        setQueriesUsed(data.queriesUsed)
        if (data.queriesUsed >= MAX_QUERIES) setLimitReached(true)
      }
    } catch {
      setMessages(prev => {
        const next = [...prev, { role: 'oracle' as const, content: 'Error de conexión. Intentá de nuevo.' }]
        setLastOracleIndex(next.length - 1)
        return next
      })
    }

    setLoading(false)
  }

  const queriesLeft = MAX_QUERIES - queriesUsed

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] md:h-[calc(100dvh-0px)] max-w-2xl mx-auto px-4 py-6">

      {/* Botón volver */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-base font-bold text-white hover:text-[#A855F7] transition-colors mb-4">
        <ArrowLeft size={20} />
        Volver al Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center shadow-lg shadow-purple-900/40">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-bebas text-4xl text-white tracking-wider">El Oráculo</h1>
            <p className="text-sm font-semibold text-[#A855F7]">Análisis estadístico · Mundial 2026</p>
          </div>
        </div>
        {!loadingQueries && (
          <div className="text-right">
            <p className="text-3xl font-bebas text-[#FFD700]">{queriesLeft}</p>
            <p className="text-xs font-bold text-[#86EFAC] uppercase tracking-wider">consultas</p>
          </div>
        )}
      </div>

      {/* Barra de progreso */}
      {!loadingQueries && (
        <div className="mb-4">
          <div className="w-full h-1.5 bg-[#2A2A4A] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-full transition-all duration-500"
              style={{ width: `${(queriesUsed / MAX_QUERIES) * 100}%` }}
            />
          </div>
          <p className="text-xs text-white font-semibold mt-1">{queriesUsed} de {MAX_QUERIES} consultas usadas</p>
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1">

        {messages.length === 0 && !loadingQueries && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#7C3AED]/20 to-[#A855F7]/10 border border-[#7C3AED]/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-[#A855F7]" />
                <span className="text-base font-bold text-[#A855F7]">El Oráculo</span>
              </div>
              <p className="text-base text-white leading-relaxed">
                Soy El Oráculo del Mundial 2026. Analizo estadísticas, historial de enfrentamientos y probabilidades matemáticas para darte predicciones precisas. Tenés <span className="font-bold text-[#FFD700]">{queriesLeft} consultas</span> disponibles. ¿Qué querés saber?
              </p>
            </div>
            <div>
              <p className="text-base font-bold text-white mb-3">Preguntas sugeridas:</p>
              <div className="grid grid-cols-1 gap-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => handleAsk(q)}
                    className="text-left px-4 py-3 bg-[#1A1A2E] border border-[#2A2A4A] hover:border-[#A855F7] hover:bg-[#A855F7]/5 rounded-xl text-base text-white font-medium transition-all">
                    ✦ {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'oracle' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center mr-2 shrink-0 mt-1 shadow-md shadow-purple-900/40">
                <Sparkles size={14} className="text-white" />
              </div>
            )}
            <div className={`max-w-[88%] px-4 py-3 rounded-2xl text-base leading-relaxed ${
              m.role === 'user'
                ? 'bg-[#FFD700]/10 text-white border border-[#FFD700]/30 font-semibold'
                : 'bg-[#1A1A2E] border border-[#7C3AED]/30'
            }`}>
              {m.role === 'oracle' && i === lastOracleIndex
                ? <TypewriterText text={m.content} />
                : m.role === 'oracle'
                  ? <TypewriterText text={m.content} />
                  : <p>{m.content}</p>
              }
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center shrink-0 shadow-md shadow-purple-900/40">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="bg-[#1A1A2E] border border-[#7C3AED]/30 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-white">
                <Loader2 size={16} className="animate-spin text-[#A855F7]" />
                <span className="text-base">El Oráculo está analizando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {limitReached ? (
        <div className="bg-[#1A1A2E] border border-[#7C3AED]/30 rounded-2xl p-4 flex items-center gap-3">
          <Lock size={20} className="text-[#A855F7] shrink-0" />
          <p className="text-base text-white font-semibold">Límite alcanzado. Próximamente podrás adquirir más consultas.</p>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            placeholder="Preguntá al Oráculo..."
            className="flex-1 bg-[#1A1A2E] border border-[#2A2A4A] focus:border-[#A855F7] rounded-xl px-4 py-3 text-base text-white font-medium focus:outline-none placeholder:text-gray-500 transition-all"
          />
          <button onClick={() => handleAsk()} disabled={loading || !question.trim()}
            className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white rounded-xl px-4 py-3 disabled:opacity-40 transition-all hover:opacity-90">
            <Send size={20} />
          </button>
        </div>
      )}
    </div>
  )
}
