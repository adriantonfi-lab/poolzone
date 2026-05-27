'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Smile, ArrowLeft, ImagePlus, X, Flag, Trash2 } from 'lucide-react'
import Link from 'next/link'

type Message = {
  id: string
  sender_id: string
  content: string
  media_url: string | null
  created_at: string
  is_system: boolean
  reactions: Record<string, string[]> | null
  profiles?: { username: string; avatar_url: string | null }
}

type OnlineUser = {
  user_id: string
  username: string
  avatar_url: string | null
}

const EMOJIS = ['⚽', '🔥', '🏆', '👏', '😂', '😮', '❤️', '💪', '🎉', '😍', '🤣', '😭', '🙌', '💯', '🎯', '⚡', '🥅', '🏅', '🎊', '😤', '🤦', '🙏', '👀', '🫡', '🤩', '😱', '💥', '🫶', '🥳', '🤪']

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

function Avatar({ url, name, size = 8 }: { url: string | null; name: string; size?: number }) {
  const s = `w-${size} h-${size}`
  return url ? (
    <img src={url} alt={name} className={`${s} rounded-full object-cover border-2 border-white/10 shrink-0`} />
  ) : (
    <div className={`${s} rounded-full bg-[#00C896]/20 border-2 border-[#00C896]/30 flex items-center justify-center shrink-0`}>
      <span className="font-sans text-sm text-[#00C896]">{name?.[0]?.toUpperCase()}</span>
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  )
}

export default function LockerRoomPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState('')
  const [username, setUsername] = useState('')
  const [userRole, setUserRole] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [showEmojis, setShowEmojis] = useState(false)
  const [loading, setLoading] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showGifs, setShowGifs] = useState(false)
  const [gifSearch, setGifSearch] = useState('')
  const [gifs, setGifs] = useState<any[]>([])
  const [loadingGifs, setLoadingGifs] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [isBanned, setIsBanned] = useState(false)
  const [muteReason, setMuteReason] = useState('')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [reportedMsg, setReportedMsg] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const presenceChannelRef = useRef<any>(null)
  const messagesChannelRef = useRef<any>(null)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user || !mounted) return
      setUserId(user.id)

      const { data: prof } = await supabase.from('profiles').select('username, avatar_url, role').eq('id', user.id).single()
      if (!mounted) return
      const uname = prof?.username || ''
      const uavatar = prof?.avatar_url || null
      const urole = prof?.role || 'guest'
      setUsername(uname)
      setAvatarUrl(uavatar)
      setUserRole(urole)

      const statusRes = await fetch(`/api/social/moderation?action=check_status&userId=${user.id}`)
      const statusData = await statusRes.json()
      if (mounted) {
        setIsMuted(statusData.isMuted)
        setIsBanned(statusData.isBanned)
        setMuteReason(statusData.reason || '')
      }

      const { data } = await supabase
        .from('chat_messages')
        .select('*, profiles(username, avatar_url)')
        .eq('channel', 'general')
        .order('created_at', { ascending: true })
        .limit(100)
      if (mounted) {
        setMessages(data || [])
        setLoading(false)
      }

      const msgChannel = supabase.channel('chat-messages-v2')
      msgChannel.on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages', filter: 'channel=eq.general'
      }, async (payload) => {
        const { data: msg } = await supabase
          .from('chat_messages')
          .select('*, profiles(username, avatar_url)')
          .eq('id', payload.new.id)
          .single()
        if (msg && mounted) setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
      })
      msgChannel.on('postgres_changes', {
        event: 'DELETE', schema: 'public', table: 'chat_messages'
      }, (payload) => {
        if (mounted) setMessages(prev => prev.filter(m => m.id !== payload.old.id))
      })
      msgChannel.subscribe()
      messagesChannelRef.current = msgChannel

      const presChannel = supabase.channel('chat-presence', {
        config: { presence: { key: user.id } }
      })
      presChannel
        .on('presence', { event: 'sync' }, () => {
          if (!mounted) return
          const state = presChannel.presenceState()
          const users: OnlineUser[] = Object.values(state).flat().map((u: any) => ({
            user_id: u.user_id,
            username: u.username,
            avatar_url: u.avatar_url,
          }))
          setOnlineUsers(users)
        })
        .on('broadcast', { event: 'typing' }, ({ payload }) => {
          if (!mounted || payload.user_id === user.id) return
          setTypingUsers(prev => prev.includes(payload.username) ? prev : [...prev, payload.username])
          setTimeout(() => setTypingUsers(prev => prev.filter(u => u !== payload.username)), 3000)
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && mounted) {
            await presChannel.track({ user_id: user.id, username: uname, avatar_url: uavatar })
          }
        })
      presenceChannelRef.current = presChannel
    })

    return () => {
      mounted = false
      const supabase = createClient()
      if (messagesChannelRef.current) supabase.removeChannel(messagesChannelRef.current)
      if (presenceChannelRef.current) supabase.removeChannel(presenceChannelRef.current)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers])

  async function searchGifs(query: string) {
    setLoadingGifs(true)
    try {
      const q = query || 'football world cup celebration'
      const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${process.env.NEXT_PUBLIC_GIPHY_API_KEY}&q=${encodeURIComponent(q)}&limit=24&rating=g`)
      const data = await res.json()
      setGifs(data.data || [])
    } catch { setGifs([]) }
    setLoadingGifs(false)
  }

  async function sendGif(gifUrl: string) {
    if (!userId || isMuted || isBanned) return
    setShowGifs(false)
    await fetch('/api/social/moderation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_message',
        userId,
        content: '',
        channel: 'general',
        mediaUrl: gifUrl,
        messageType: 'image',
      })
    })
  }

  function handleTyping() {
    if (!presenceChannelRef.current || !userId) return
    presenceChannelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: userId, username }
    })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Máximo 5MB'); return }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function cancelImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function sendMessage() {
    if ((!input.trim() && !imageFile) || sending || !userId) return
    if (isBanned || isMuted) return

    setSending(true)
    const supabase = createClient()
    let mediaUrl: string | null = null

    if (imageFile) {
      setUploadingImage(true)
      const ext = imageFile.name.split('.').pop()
      const path = `chat/${userId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(path, imageFile, { contentType: imageFile.type })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('chat-images').getPublicUrl(path)
        mediaUrl = urlData.publicUrl
      }
      setUploadingImage(false)
      cancelImage()
    }

    const text = input.trim()
    setInput('')

    await fetch('/api/social/moderation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_message',
        userId,
        content: text,
        channel: 'general',
        mediaUrl,
        messageType: mediaUrl ? 'image' : 'text',
      })
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
    const newUsers = users.includes(userId) ? users.filter(u => u !== userId) : [...users, userId]
    const newReactions = { ...reactions, [emoji]: newUsers }
    if (newUsers.length === 0) delete newReactions[emoji]
    await supabase.from('chat_messages').update({ reactions: newReactions }).eq('id', messageId)
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions: newReactions } : m))
  }

  async function deleteMessage(messageId: string) {
    await fetch('/api/social/moderation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_message', userId, messageId })
    })
    setActiveMenu(null)
  }

  async function reportMessage(messageId: string) {
    await fetch('/api/social/moderation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'report_message', userId, messageId, reason: 'Contenido inapropiado' })
    })
    setReportedMsg(messageId)
    setActiveMenu(null)
    setTimeout(() => setReportedMsg(null), 3000)
  }

  const isAdmin = userRole === 'admin' || userRole === 'super_admin'

  const grouped: { day: string; messages: Message[] }[] = []
  for (const msg of messages) {
    const day = formatDay(msg.created_at)
    const last = grouped[grouped.length - 1]
    if (last && last.day === day) last.messages.push(msg)
    else grouped.push({ day, messages: [msg] })
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] md:h-screen" onClick={() => setActiveMenu(null)}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#0D0D1A] border-b border-white/10 shrink-0">
        <Link href="/dashboard" className="text-white hover:text-[#00C896] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="w-9 h-9 rounded-full bg-[#00C896]/20 flex items-center justify-center">
          <span className="text-lg">⚽</span>
        </div>
        <div className="flex-1">
          <p className="font-sans text-lg text-white tracking-wider leading-none">Chat del Quilombo</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-xs text-[#22C55E] font-bold">{onlineUsers.length} online</span>
          </div>
        </div>
        <div className="flex -space-x-2">
          {onlineUsers.slice(0, 5).map(u => (
            <div key={u.user_id} title={`@${u.username}`}>
              {u.avatar_url ? (
                <img src={u.avatar_url} alt={u.username} className="w-8 h-8 rounded-full object-cover border-2 border-[#1A1A2E]" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#00C896]/30 border-2 border-[#1A1A2E] flex items-center justify-center">
                  <span className="font-sans text-xs text-[#00C896]">{u.username?.[0]?.toUpperCase()}</span>
                </div>
              )}
            </div>
          ))}
          {onlineUsers.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-[#2A2A4A] border-2 border-[#1A1A2E] flex items-center justify-center">
              <span className="text-xs text-white font-bold">+{onlineUsers.length - 5}</span>
            </div>
          )}
        </div>
      </div>

      {isBanned && (
        <div className="bg-red-500/20 border-b border-red-500/40 px-4 py-3 text-center">
          <p className="text-red-400 font-bold text-sm">🚫 Tu cuenta fue suspendida. {muteReason}</p>
        </div>
      )}

      {isMuted && !isBanned && (
        <div className="bg-orange-500/20 border-b border-orange-500/40 px-4 py-3 text-center">
          <p className="text-orange-400 font-bold text-sm">🔇 Estás silenciado temporalmente. {muteReason}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-[#0A0A18]">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <p className="text-white font-sans text-xl animate-pulse">Loading messages...</p>
          </div>
        )}

        {grouped.map(({ day, messages: dayMsgs }) => (
          <div key={day}>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#2A2A4A]" />
              <span className="text-xs font-bold text-gray-500 px-2">{day}</span>
              <div className="flex-1 h-px bg-[#2A2A4A]" />
            </div>

            {dayMsgs.map((msg, i) => {
              const isMe = msg.sender_id === userId
              const prevMsg = dayMsgs[i - 1]
              const showHeader = !prevMsg || prevMsg.sender_id !== msg.sender_id
              const hasReactions = msg.reactions && Object.keys(msg.reactions).length > 0
              const isMenuOpen = activeMenu === msg.id
              const wasReported = reportedMsg === msg.id

              if (msg.is_system) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="text-xs text-gray-500 bg-[#0D0D1A] px-3 py-1 rounded-full">{msg.content}</span>
                  </div>
                )
              }

              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                  <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {showHeader ? (
                      <Avatar url={msg.profiles?.avatar_url || null} name={msg.profiles?.username || '?'} size={8} />
                    ) : (
                      <div className="w-8 shrink-0" />
                    )}
                    <div className="relative">
                      {showHeader && (
                        <p className={`text-xs font-bold mb-1 ${isMe ? 'text-right mr-1 text-[#22C55E]' : 'ml-1 text-[#22C55E]'}`}>
                          @{msg.profiles?.username || 'vos'}
                        </p>
                      )}
                      <div
                        className={`rounded-2xl overflow-hidden cursor-pointer ${isMe ? 'bg-[#1A3A1A] border border-[#22C55E]/20 rounded-br-sm' : 'bg-[#0D0D1A] border border-white/10 rounded-bl-sm'}`}
                        onClick={(e) => { e.stopPropagation(); setActiveMenu(isMenuOpen ? null : msg.id) }}
                      >
                        {msg.media_url && (
                          <a href={msg.media_url} target="_blank" rel="noopener noreferrer">
                            <img src={msg.media_url} alt="imagen" className="max-w-[260px] max-h-[260px] object-contain bg-[#080812] w-full" />
                          </a>
                        )}
                        {msg.content && (
                          <div className="px-3 py-2">
                            <p className="text-base text-white leading-snug">{msg.content}</p>
                          </div>
                        )}
                        <div className="px-3 pb-1.5">
                          <p className="text-xs text-gray-500 text-right">{formatTime(msg.created_at)}</p>
                        </div>
                      </div>

                      {isMenuOpen && (
                        <div
                          className={`absolute z-50 bg-[#0D0D1A] border border-white/10 rounded-xl shadow-xl p-1 min-w-[160px] ${isMe ? 'right-0' : 'left-0'} top-full mt-1`}
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="flex gap-1 px-2 py-1 border-b border-white/10 mb-1">
                            {EMOJIS.slice(0, 5).map(emoji => (
                              <button key={emoji} onClick={() => { addReaction(msg.id, emoji); setActiveMenu(null) }}
                                className="text-lg hover:scale-125 transition-transform">{emoji}</button>
                            ))}
                          </div>
                          {!isMe && (
                            <button onClick={() => reportMessage(msg.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors">
                              <Flag size={14} />
                              {wasReported ? '¡Reported!' : 'Report message'}
                            </button>
                          )}
                          {(isAdmin || isMe) && (
                            <button onClick={() => deleteMessage(msg.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                              <Trash2 size={14} />
                              Delete message
                            </button>
                          )}
                        </div>
                      )}

                      {hasReactions && (
                        <div className="flex flex-wrap gap-1 mt-1 ml-1">
                          {Object.entries(msg.reactions!).map(([emoji, users]) =>
                            users.length > 0 && (
                              <button key={emoji} onClick={() => addReaction(msg.id, emoji)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${users.includes(userId) ? 'bg-[#00C896]/20 border-[#00C896]/40 text-[#00C896]' : 'bg-[#0D0D1A] border-white/10 text-white'}`}>
                                {emoji} {users.length}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#2A2A4A] flex items-center justify-center">
              <span className="text-xs text-gray-400">✍️</span>
            </div>
            <div className="bg-[#0D0D1A] border border-white/10 rounded-2xl rounded-bl-sm">
              <div className="px-2">
                <p className="text-xs text-gray-400 px-1 pt-1">{typingUsers.join(', ')} está escribiendo...</p>
                <TypingDots />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 bg-[#0D0D1A] border-t border-white/10 px-4 py-3">
        {showGifs && (
          <div className="mb-3 bg-[#080812] border border-white/10 rounded-xl p-3">
            <div className="flex gap-2 mb-3">
              <input value={gifSearch} onChange={e => setGifSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchGifs(gifSearch)}
                placeholder="Buscar GIFs... (Enter)"
                className="flex-1 bg-[#0D0D1A] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#22C55E]" />
              <button onClick={() => searchGifs(gifSearch)} className="bg-[#22C55E] text-black font-bold px-3 py-2 rounded-xl text-sm">🔍</button>
              <button onClick={() => setShowGifs(false)} className="text-gray-400 hover:text-white px-2"><X size={18} /></button>
            </div>
            {loadingGifs ? (
              <p className="text-center text-gray-400 text-sm py-4 animate-pulse">Buscando GIFs...</p>
            ) : (
              <div className="grid grid-cols-4 gap-1.5 max-h-64 overflow-y-auto">
                {gifs.map((gif: any) => (
                  <button key={gif.id} onClick={() => sendGif(gif.images.original.url)}
                    className="rounded-lg overflow-hidden hover:opacity-80 transition-opacity bg-[#0D0D1A] aspect-square">
                    <img
                      src={gif.images.fixed_height_small.url}
                      alt={gif.title}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
                {gifs.length === 0 && (
                  <p className="col-span-4 text-center text-gray-400 text-sm py-4">Buscá algo para ver GIFs ⚽</p>
                )}
              </div>
            )}
          </div>
        )}

        {imagePreview && (
          <div className="relative inline-block mb-3">
            <img src={imagePreview} alt="preview" className="h-20 w-20 object-cover rounded-xl border border-white/10" />
            <button onClick={cancelImage} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <X size={12} className="text-white" />
            </button>
          </div>
        )}

        {showEmojis && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => { setInput(p => p + e); setShowEmojis(false) }}
                className="text-2xl hover:scale-125 transition-transform">{e}</button>
            ))}
          </div>
        )}

        {isBanned ? (
          <div className="text-center py-2">
            <p className="text-red-400 text-sm font-bold">🚫 You cannot send messages</p>
          </div>
        ) : isMuted ? (
          <div className="text-center py-2">
            <p className="text-orange-400 text-sm font-bold">🔇 Estás silenciado temporalmente</p>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <button onClick={() => setShowEmojis(p => !p)} className="text-gray-400 hover:text-[#00C896] transition-colors shrink-0">
              <Smile size={22} />
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-[#22C55E] transition-colors shrink-0">
              <ImagePlus size={22} />
            </button>
            <button onClick={() => { setShowGifs(p => !p); if (!showGifs) searchGifs('football') }}
              className="text-gray-400 hover:text-[#A855F7] transition-colors shrink-0 font-bold text-sm">
              GIF
            </button>
            <input ref={fileInputRef} type="file" accept="image/*, .gif" className="hidden" onChange={handleImageSelect} />
            <input ref={inputRef} value={input}
              onChange={e => { setInput(e.target.value); handleTyping() }}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type something al Chat del Quilombo..."
              className="flex-1 bg-[#080812] border border-white/10 rounded-xl px-4 py-2.5 text-base text-white focus:outline-none focus:border-[#22C55E] transition-colors"
            />
            <button onClick={sendMessage} disabled={sending || (!input.trim() && !imageFile)}
              className="bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold px-4 py-2.5 rounded-xl disabled:opacity-40 transition-colors shrink-0">
              {uploadingImage ? <span className="animate-pulse text-sm">...</span> : <Send size={18} />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
