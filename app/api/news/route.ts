import { NextResponse } from 'next/server'

const FEEDS = {
  argentina: [
    'https://www.infobae.com/feeds/rss/deportes/',
    'https://www.clarin.com/rss/deportes/',
  ],
  colombia: [
    'https://www.eltiempo.com/rss/deportes.xml',
    'https://www.futbolred.com/rss/seleccion-colombia',
  ],
}

type NewsItem = {
  title: string
  link: string
  pubDate: string
  description: string
  country: 'argentina' | 'colombia'
}

function parseXML(xml: string, country: 'argentina' | 'colombia'): NewsItem[] {
  const items: NewsItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1]
    const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
                  item.match(/<title>(.*?)<\/title>/)?.[1] || ''
    const link = item.match(/<link>(.*?)<\/link>/)?.[1] ||
                 item.match(/<guid>(.*?)<\/guid>/)?.[1] || ''
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
    const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                        item.match(/<description>(.*?)<\/description>/)?.[1] || ''

    if (title && link) {
      items.push({
        title: title.trim(),
        link: link.trim(),
        pubDate: pubDate.trim(),
        description: description.replace(/<[^>]*>/g, '').trim().slice(0, 150),
        country,
      })
    }
  }
  return items.slice(0, 5)
}

// Cache simple en memoria
let cache: { data: NewsItem[]; timestamp: number } | null = null
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutos
cache = null // reset cache

export async function GET() {
  try {
    // Usar cache si está fresco
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json(cache.data)
    }

    const allNews: NewsItem[] = []

    // Fetch feeds en paralelo con timeout
    const fetchFeed = async (url: string, country: 'argentina' | 'colombia') => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)
        const res = await fetch(url, { signal: controller.signal, next: { revalidate: 900 } })
        clearTimeout(timeout)
        if (!res.ok) return []
        const xml = await res.text()
        return parseXML(xml, country)
      } catch {
        return []
      }
    }

    const results = await Promise.allSettled([
      fetchFeed(FEEDS.argentina[0], 'argentina'),
      fetchFeed(FEEDS.argentina[1], 'argentina'),
      fetchFeed(FEEDS.colombia[0], 'colombia'),
      fetchFeed(FEEDS.colombia[1], 'colombia'),
    ])

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value)
      }
    }

    // Placeholders para Argentina si no hay noticias
    const argNews = allNews.filter(n => n.country === 'argentina')
    if (argNews.length === 0) {
      allNews.push(
        { title: 'Argentina se prepara para el Mundial 2026', link: 'https://www.infobae.com/deportes/', pubDate: new Date().toISOString(), description: 'La selección argentina continúa su preparación para defender el título mundial en USA, México y Canadá.', country: 'argentina' },
        { title: 'Messi y la Albiceleste, listos para el desafío', link: 'https://www.clarin.com/deportes/', pubDate: new Date().toISOString(), description: 'El capitán argentino lidera los entrenamientos de cara al Mundial 2026.', country: 'argentina' },
      )
    }

    // Si no hay noticias de ningún lado
    if (allNews.length === 0) {
      return NextResponse.json([
        { title: 'Argentina se prepara para el Mundial 2026', link: '#', pubDate: new Date().toISOString(), description: 'La selección argentina continúa su preparación para defender el título mundial.', country: 'argentina' },
        { title: 'Colombia lista para el Mundial 2026', link: '#', pubDate: new Date().toISOString(), description: 'La tricolor colombiana sueña con una histórica actuación en el torneo.', country: 'colombia' },
      ])
    }

    // Ordenar: intercalar ARG y COL
    const arg = allNews.filter(n => n.country === 'argentina').slice(0, 4)
    const col = allNews.filter(n => n.country === 'colombia').slice(0, 4)
    const mixed: NewsItem[] = []
    const max = Math.max(arg.length, col.length)
    for (let i = 0; i < max; i++) {
      if (arg[i]) mixed.push(arg[i])
      if (col[i]) mixed.push(col[i])
    }

    cache = { data: mixed, timestamp: Date.now() }
    return NextResponse.json(mixed)

  } catch (err) {
    console.error('News fetch error:', err)
    return NextResponse.json([])
  }
}
