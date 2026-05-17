'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Smile, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
  is_system: boolean
  reactions: Record<string, string[]> | null
  profiles?: {
    username: string
    avatar_url: string | null
  }
}

const EMOJIS = ['⚽', '🔥', '🏆', '👏', '😂', '😮', '❤️', '💪']

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function formatDay(d: string) {
  const date = new Date(d)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Hoy'
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer'
  return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
}

export default function LockerRoomPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState('')
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [showEmojis, setShowEmojis] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)

      supabase.from('profiles').select('username, avatar_url').eq('id', user.id).single()
        .then(({ data }) => {
          setUsername(data?.username || '')
          setAvatarUrl(data?.avatar_url || null)
        })

      // Cargar mensajes iniciales
      supabase.from('chat_messages')
        .select('*, profiles(username, avatar_url)')
        .eq('channel', 'general')
        .order('created_at', { ascending: true })
        .limit(100)
        .then(({ data }) => {
          setMessages(data || [])
          setLoading(false)
        })

      // Suscripción realtime
      const channel = supabase
        .channel('locker-room')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: 'channel=eq.general'
        }, async (payload) => {
          // Fetch el mensaje completo con el perfil
          const { data } = await supabase
            .from('chat_messages')
            .select('*, profiles(username, avatar_url)')
            .eq('id', payload.new.id)
            .single()
          if (data) setMessages(prev => [...prev, data])
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || sending || !userId) return
    setSending(true)
    const text = input.trim()
    setInput('')

    const supabase = createClient()
    await supabase.from('chat_messages').insert({
      sender_id: userId,
      channel: 'general',
      content: text,
      message_type: 'text',
      is_system: false,
    })
    setSending(false)
    inputRef.current?.focus()
  }

  async function addReaction(messageId: string, emoji: string) {
    const supabase = createClient()
    const msg = messages.find(m => m.id === messageId)
    if (!msg) return

    const reactions = msg.reactions || {}
    const users = reactions[emoji] || []
    const newUsers = users.includes(userId)
      ? users.filter(u => u !== userId)
      : [...users, userId]

    const newReactions = { ...reactions, [emoji]: newUsers }
    if (newUsers.length === 0) delete newReactions[emoji]

    await supabase.from('chat_messages').update({ reactions: newReactions }).eq('id', messageId)
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions: newReactions } : m))
  }

  // Agrupar mensajes por día
  const grouped: { day: string; messages: Message[] }[] = []
  for (const msg of messages) {
    const day = formatDay(msg.created_at)
    const last = grouped[grouped.length - 1]
    if (last && last.day === day) {
      last.messages.push(msg)
    } else {
      grouped.push({ day, messages: [msg] })
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] md:h-screen">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#1A1A2E] border-b border-[#2A2A4A] shrink-0">
        <Link href="/dashboard" className="text-white hover:text-[#FFD700] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="w-9 h-9 rounded-xl bg-[#FFD700]/20 flex items-center justify-center">
          <span className="text-lg">⚽</span>
        </div>
        <div className="flex-1">
          <p className="font-bebas text-lg text-white tracking-wider leading-none">Chat del Quilombo</p>
          <p className="text-xs text-[#22C55E] font-bold">Chat familiar · Mundial 2026</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-xs text-[#22C55E] font-bold">En vivo</span>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-[#0A0A18]">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <p className="text-white font-bebas text-xl animate-pulse">Cargando mensajes...</p>
          </div>
        )}

        {grouped.map(({ day, messages: dayMsgs }) => (
          <div key={day}>
            {/* Separador de día */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#2A2A4A]" />
              <span className="text-xs font-bold text-gray-500 px-2">{day}</span>
              <div className="flex-1 h-px bg-[#2A2A4A]" />
            </div>

            {dayMsgs.map((msg, i) => {
              const isMe = msg.sender_id === userId
              const prevMsg = dayMsgs[i - 1]
              const showHeader = !prevMsg || prevMsg.sender_id !== msg.sender_id || isMe !== (prevMsg.sender_id === userId)
              const hasReactions = msg.reactions && Object.keys(msg.reactions).length > 0

              if (msg.is_system) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="text-xs text-gray-500 bg-[#1A1A2E] px-3 py-1 rounded-full">{msg.content}</span>
                  </div>
                )
              }

              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                  <div className={`flex gap-2 max-w-[78%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    {!isMe && showHeader && (
                      msg.profiles?.avatar_url ? (
                        <img src={msg.profiles.avatar_url} alt={msg.profiles.username}
                          className="w-8 h-8 rounded-xl object-cover shrink-0 self-end" />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-[#FFD700]/20 flex items-center justify-center shrink-0 self-end">
                          <span className="font-bebas text-sm text-[#FFD700]">{msg.profiles?.username?.[0]?.toUpperCase()}</span>
                        </div>
                      )
                    )}
                    {!isMe && !showHeader && <div className="w-8 shrink-0" />}

                    <div>
                      {!isMe && showHeader && (
                        <p className="text-xs font-bold text-[#22C55E] mb-1 ml-1">@{msg.profiles?.username}</p>
                      )}
                      <div
                        className={`px-3 py-2 rounded-2xl cursor-pointer group ${
                          isMe
                            ? 'bg-[#1A3A1A] border border-[#22C55E]/20 rounded-br-sm'
                            : 'bg-[#1A1A2E] border border-[#2A2A4A] rounded-bl-sm'
                        }`}
                        onClick={() => setShowEmojis(false)}>
                        <p className="text-base text-white leading-snug">{msg.content}</p>
                        <p className="text-xs text-gray-500 mt-0.5 text-right">{formatTime(msg.created_at)}</p>
                      </div>

                      {/* Reacciones */}
                      {hasReactions && (
                        <div className="flex flex-wrap gap-1 mt-1 ml-1">
                          {Object.entries(msg.reactions!).map(([emoji, users]) =>
                            users.length > 0 && (
                              <button key={emoji} onClick={() => addReaction(msg.id, emoji)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${
                                  users.includes(userId)
                                    ? 'bg-[#FFD700]/20 border-[#FFD700]/40 text-[#FFD700]'
                                    : 'bg-[#1A1A2E] border-[#2A2A4A] text-white'
                                }`}>
                                {emoji} {users.length}
                              </button>
                            )
                          )}
                        </div>
                      )}

                      {/* Botón de reaccionar */}
                      <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {EMOJIS.slice(0, 4).map(emoji => (
                          <button key={emoji} onClick={() => addReaction(msg.id, emoji)}
                            className="text-base hover:scale-125 transition-transform">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 bg-[#1A1A2E] border-t border-[#2A2A4A] px-4 py-3">
        {showEmojis && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => { setInput(p => p + e); setShowEmojis(false) }}
                className="text-2xl hover:scale-125 transition-transform">
                {e}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={() => setShowEmojis(p => !p)}
            className="text-gray-400 hover:text-[#FFD700] transition-colors shrink-0">
            <Smile size={22} />
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Escribí algo al Chat del Quilombo..."
            className="flex-1 bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-2.5 text-base text-white focus:outline-none focus:border-[#22C55E] transition-colors"
          />
          <button onClick={sendMessage} disabled={sending || !input.trim()}
            className="bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold px-4 py-2.5 rounded-xl disabled:opacity-40 transition-colors shrink-0">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
