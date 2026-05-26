import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const TEAM_CODES: Record<string, string> = {
  'Argentina':'ar','Brazil':'br','Colombia':'co','Uruguay':'uy','Mexico':'mx',
  'United States':'us','Spain':'es','France':'fr','Portugal':'pt','Germany':'de',
  'England':'gb-eng','Morocco':'ma','Senegal':'sn','Japan':'jp','South Korea':'kr',
  'Netherlands':'nl','Ecuador':'ec','Canada':'ca','Paraguay':'py','Venezuela':'ve',
  'Bolivia':'bo','Peru':'pe','Chile':'cl','Costa Rica':'cr','Panama':'pa',
  'Saudi Arabia':'sa','Australia':'au','Iran':'ir','Qatar':'qa','Croatia':'hr',
  'Serbia':'rs','Switzerland':'ch','Ghana':'gh','Nigeria':'ng','Egypt':'eg',
  'New Zealand':'nz','Belgium':'be','Poland':'pl','Turkey':'tr','South Africa':'za',
  'Cameroon':'cm','Ivory Coast':'ci','Tunisia':'tn','Algeria':'dz','Kenya':'ke',
  'Mali':'ml','Honduras':'hn','Jamaica':'jm','Cuba':'cu','El Salvador':'sv',
}

const TEAM_NAMES: Record<string, string> = {
  'Argentina':'Argentina','Brazil':'Brasil','Colombia':'Colombia','Uruguay':'Uruguay',
  'Mexico':'México','United States':'Estados Unidos','Spain':'España','France':'Francia',
  'Portugal':'Portugal','Germany':'Alemania','England':'Inglaterra','Morocco':'Marruecos',
  'Senegal':'Senegal','Japan':'Japón','South Korea':'Corea del Sur','Netherlands':'Países Bajos',
  'Ecuador':'Ecuador','Canada':'Canadá','Paraguay':'Paraguay','Venezuela':'Venezuela',
  'Bolivia':'Bolivia','Peru':'Perú','Chile':'Chile','Costa Rica':'Costa Rica',
  'Panama':'Panamá','Saudi Arabia':'Arabia Saudita','Australia':'Australia','Iran':'Irán',
  'Qatar':'Qatar','Croatia':'Croacia','Serbia':'Serbia','Switzerland':'Suiza',
  'Ghana':'Ghana','Nigeria':'Nigeria','Egypt':'Egipto','New Zealand':'Nueva Zelanda',
  'Belgium':'Bélgica','Poland':'Polonia','Turkey':'Turquía','South Africa':'Sudáfrica',
  'Cameroon':'Camerún','Ivory Coast':'Costa de Marfil','Tunisia':'Túnez','Algeria':'Argelia',
}

function mapStage(round: string): string {
  if (round?.includes('Group')) return 'Group Stage'
  if (round?.includes('Round of 16') || round?.includes('Last 16')) return 'Round of 16'
  if (round?.includes('Quarter')) return 'Quarter-finals'
  if (round?.includes('Semi')) return 'Semi-finals'
  if (round?.includes('Final') && !round?.includes('Semi')) return 'Final'
  return round || 'Group Stage'
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  if (!url.searchParams.has('manual')) {
    return NextResponse.json({ error: 'Manual only' }, { status: 401 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const res = await fetch(
      'https://v3.football.api-sports.io/fixtures?league=1&season=2026',
      { headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY! } }
    )
    const data = await res.json()
    const fixtures = data.response || []

    let inserted = 0
    let updated = 0

    for (const fixture of fixtures) {
      const f = fixture.fixture
      const teams = fixture.teams
      const goals = fixture.goals
      const league = fixture.league

      const homeName = TEAM_NAMES[teams.home.name] || teams.home.name
      const awayName = TEAM_NAMES[teams.away.name] || teams.away.name
      const homeCode = TEAM_CODES[teams.home.name] || teams.home.name.toLowerCase().slice(0,2)
      const awayCode = TEAM_CODES[teams.away.name] || teams.away.name.toLowerCase().slice(0,2)

      const matchData = {
        home_team: homeName,
        away_team: awayName,
        home_team_code: homeCode,
        away_team_code: awayCode,
        match_date: new Date(f.date).toISOString(),
        stage: mapStage(league.round),
        group_name: league.round,
        venue: f.venue?.name || '',
        status: f.status?.short === 'FT' ? 'finished' : 'scheduled',
        home_score: goals.home,
        away_score: goals.away,
      }

      const { data: existing } = await supabase
        .from('matches')
        .select('id')
        .eq('home_team', homeName)
        .eq('away_team', awayName)
        .eq('match_date', matchData.match_date)
        .single()

      if (existing) {
        await supabase.from('matches').update(matchData).eq('id', existing.id)
        updated++
      } else {
        await supabase.from('matches').insert(matchData)
        inserted++
      }
    }

    return NextResponse.json({ success: true, total: fixtures.length, inserted, updated })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
