// app/api/football-sync/route.ts
// Este endpoint se llama automáticamente por Vercel Cron cada 2 minutos
// También puede llamarse manualmente desde el panel admin

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY!
const FOOTBALL_API_URL = 'https://v3.football.api-sports.io'
const WORLD_CUP_LEAGUE = 1
const WORLD_CUP_SEASON = 2026

async function fetchFootball(endpoint: string) {
  const res = await fetch(`${FOOTBALL_API_URL}/${endpoint}`, {
    headers: {
      'x-apisports-key': FOOTBALL_API_KEY,
    },
  })
  return res.json()
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Mapeo de nombres de equipos API → nombres en Supabase
const TEAM_MAP: Record<string, string> = {
  'Argentina': 'Argentina',
  'Brazil': 'Brasil',
  'Colombia': 'Colombia',
  'Uruguay': 'Uruguay',
  'Mexico': 'México',
  'USA': 'Estados Unidos',
  'United States': 'Estados Unidos',
  'Spain': 'España',
  'France': 'Francia',
  'Portugal': 'Portugal',
  'Germany': 'Alemania',
  'England': 'Inglaterra',
  'Morocco': 'Marruecos',
  'Senegal': 'Senegal',
  'Japan': 'Japón',
  'South Korea': 'Corea del Sur',
  'Netherlands': 'Países Bajos',
  'Ecuador': 'Ecuador',
  'Canada': 'Canadá',
  'Paraguay': 'Paraguay',
  'Venezuela': 'Venezuela',
  'Bolivia': 'Bolivia',
  'Peru': 'Perú',
  'Chile': 'Chile',
  'Costa Rica': 'Costa Rica',
  'Panama': 'Panamá',
  'Saudi Arabia': 'Arabia Saudita',
  'Australia': 'Australia',
  'Iran': 'Irán',
  'Qatar': 'Qatar',
  'Croatia': 'Croacia',
  'Serbia': 'Serbia',
  'Switzerland': 'Suiza',
  'Ghana': 'Ghana',
  'Nigeria': 'Nigeria',
  'Egypt': 'Egipto',
  'New Zealand': 'Nueva Zelanda',
  'Belgium': 'Bélgica',
  'Poland': 'Polonia',
  'Turkey': 'Turquía',
  'South Africa': 'Sudáfrica',
  'Cameroon': 'Camerún',
  "Ivory Coast": 'Costa de Marfil',
  'Tunisia': 'Túnez',
  'Algeria': 'Argelia',
}

function mapTeamName(name: string): string {
  return TEAM_MAP[name] || name
}

function mapStatus(status: string): string {
  if (['NS', 'TBD'].includes(status)) return 'scheduled'
  if (['1H', 'HT', '2H', 'ET', 'P', 'BT', 'LIVE'].includes(status)) return 'live'
  if (['FT', 'AET', 'PEN'].includes(status)) return 'finished'
  if (['SUSP', 'INT', 'PST', 'CANC', 'ABD', 'AWD', 'WO'].includes(status)) return 'postponed'
  return 'scheduled'
}

export async function GET(req: Request) {
  // Verificar que es llamada legítima (desde cron o admin)
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'che-bacano-cron'
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    // Permitir también sin auth para testing manual
    const url = new URL(req.url)
    if (!url.searchParams.has('manual')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  try {
    const supabase = getSupabase()
    let updated = 0
    let goalsNotified: string[] = []

    // 1. Obtener partidos en vivo
    const liveData = await fetchFootball(`fixtures?league=${WORLD_CUP_LEAGUE}&season=${WORLD_CUP_SEASON}&live=all`)
    
    const liveFixtures = liveData.response || []

    for (const fixture of liveFixtures) {
      const f = fixture.fixture
      const teams = fixture.teams
      const goals = fixture.goals
      const score = fixture.score

      const homeTeam = mapTeamName(teams.home.name)
      const awayTeam = mapTeamName(teams.away.name)
      const status = mapStatus(f.status.short)
      const homeScore = goals.home ?? null
      const awayScore = goals.away ?? null
      const homeHalf = score.halftime.home ?? null
      const awayHalf = score.halftime.away ?? null

      // Buscar el partido en Supabase por equipos
      const { data: match } = await supabase
        .from('matches')
        .select('id, home_score, away_score, status')
        .eq('home_team', homeTeam)
        .eq('away_team', awayTeam)
        .single()

      if (!match) continue

      // Detectar gol nuevo para notificación
      const prevHome = match.home_score ?? 0
      const prevAway = match.away_score ?? 0
      const newHome = homeScore ?? 0
      const newAway = awayScore ?? 0
      const isNewGoal = (newHome + newAway) > (prevHome + prevAway)

      // Actualizar en Supabase
      await supabase.from('matches').update({
        home_score: homeScore,
        away_score: awayScore,
        status,
        home_first_half_score: homeHalf,
        away_first_half_score: awayHalf,
      }).eq('id', match.id)

      updated++

      // Notificar gol
      if (isNewGoal) {
        goalsNotified.push(`${homeTeam} ${newHome}-${newAway} ${awayTeam}`)
        
        const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://che-bacano-final.vercel.app'
        fetch(`${BASE_URL}/api/push/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'goal',
            title: '⚽ ¡GOOOL!',
            body: `${homeTeam} ${newHome}-${newAway} ${awayTeam}`,
            url: '/fixture',
            broadcast: true,
          }),
        })
      }
    }

    // 2. Obtener partidos de hoy (para actualizar estados y resultados finales)
    const today = new Date().toISOString().split('T')[0]
    const todayData = await fetchFootball(`fixtures?league=${WORLD_CUP_LEAGUE}&season=${WORLD_CUP_SEASON}&date=${today}`)
    const todayFixtures = todayData.response || []

    for (const fixture of todayFixtures) {
      const f = fixture.fixture
      const teams = fixture.teams
      const goals = fixture.goals
      const score = fixture.score
      const penalties = fixture.penalty

      const homeTeam = mapTeamName(teams.home.name)
      const awayTeam = mapTeamName(teams.away.name)
      const status = mapStatus(f.status.short)
      const homeScore = goals.home ?? null
      const awayScore = goals.away ?? null
      const homeHalf = score.halftime.home ?? null
      const awayHalf = score.halftime.away ?? null
      const homePen = penalties?.home ?? null
      const awayPen = penalties?.away ?? null

      const { data: match } = await supabase
        .from('matches')
        .select('id, status, home_score, away_score')
        .eq('home_team', homeTeam)
        .eq('away_team', awayTeam)
        .single()

      if (!match) continue

      await supabase.from('matches').update({
        home_score: homeScore,
        away_score: awayScore,
        status,
        home_first_half_score: homeHalf,
        away_first_half_score: awayHalf,
        ...(homePen !== null && { home_penalties: homePen, away_penalties: awayPen }),
      }).eq('id', match.id)

      // Si el partido recién terminó → calcular puntos automáticamente
      if (status === 'finished' && match.status !== 'finished' && homeScore !== null && awayScore !== null) {
        const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://che-bacano-final.vercel.app'
        
        // Llamar al sistema de cálculo de puntos
        fetch(`${BASE_URL}/api/admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_result',
            userId: process.env.SUPER_ADMIN_ID || '',
            matchId: match.id,
            homeScore,
            awayScore,
            homeFirstHalf: homeHalf,
            awayFirstHalf: awayHalf,
            homePenalties: homePen,
            awayPenalties: awayPen,
          }),
        })

        // Notificar resultado final
        fetch(`${BASE_URL}/api/push/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'result',
            title: 'Resultado final 🏆',
            body: `${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`,
            url: '/fixture',
            broadcast: true,
          }),
        })

        updated++
      }
    }

    return NextResponse.json({ 
      success: true, 
      updated,
      liveMatches: liveFixtures.length,
      goalsNotified,
      timestamp: new Date().toISOString()
    })

  } catch (err) {
    console.error('Football sync error:', err)
    return NextResponse.json({ error: 'Error interno', details: String(err) }, { status: 500 })
  }
}
