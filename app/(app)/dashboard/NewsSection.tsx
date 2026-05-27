'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, RefreshCw } from 'lucide-react'

type NewsItem = {
  title: string
  link: string
  pubDate: string
  description: string
  country: 'argentina' | 'colombia'
}

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 60) return `hace ${mins}m`
    if (hours < 24) return `hace ${hours}h`
    return `hace ${days}d`
  } catch {
    return ''
  }
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab] = useState<'all' | 'argentina' | 'colombia'>('all')

  async function fetchNews() {
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      setNews(data)
    } catch {
      console.error('Error fetching news')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchNews() }, [])

  function handleRefresh() {
    setRefreshing(true)
    fetchNews()
  }

  const filtered = tab === 'all' ? news : news.filter(n => n.country === tab)

  return (
    <div className="bg-[#0D0D1A] border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-lg">📰</span>
          <span className="font-sans text-lg text-white tracking-wider">Noticias</span>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="text-gray-400 hover:text-[#00C896] transition-colors disabled:opacity-40">
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {[
          { id: 'all', label: '🌎 Todas' },
          { id: 'argentina', label: '🇦🇷 Argentina' },
          { id: 'colombia', label: '🇨🇴 Colombia' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`flex-1 py-2 text-xs font-bold transition-all ${
              tab === t.id
                ? 'text-[#00C896] border-b-2 border-[#00C896] bg-[#00C896]/5'
                : 'text-gray-400 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Noticias */}
      <div className="divide-y divide-[#2A2A4A]">
        {loading ? (
          <div className="px-4 py-6 text-center">
            <div className="animate-pulse space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-12 bg-[#2A2A4A] rounded-xl" />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-6 text-center text-white text-sm">
            No hay noticias disponibles en este momento.
          </div>
        ) : (
          filtered.map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-3 px-4 py-3 hover:bg-white/3 transition-all group">
              <span className="text-lg shrink-0 mt-0.5">
                {item.country === 'argentina' ? '🇦🇷' : '🇨🇴'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-[#00C896] transition-colors">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>
                )}
                <p className="text-xs text-gray-600 mt-0.5">{timeAgo(item.pubDate)}</p>
              </div>
              <ExternalLink size={14} className="text-gray-600 group-hover:text-[#00C896] shrink-0 mt-1 transition-colors" />
            </a>
          ))
        )}
      </div>

      <div className="px-4 py-2 border-t border-white/10">
        <p className="text-xs text-gray-600 text-center">Actualizado cada 15 minutos · TyC Sports · El Tiempo</p>
      </div>
    </div>
  )
}
