import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const ORACLE_FILL_COST = 5

const FIFA_RANKING = `
FIFA Rankings World Cup 2026:
1-France, 2-Spain, 3-Argentina, 4-England, 5-Portugal, 6-Brazil, 7-Netherlands, 8-Belgium, 
9-Morocco, 10-Germany, 11-Croatia, 12-Colombia, 13-Uruguay, 14-Mexico, 15-United States, 
16-Switzerland, 17-Senegal, 18-Japan, 19-Iran, 20-Austria, 21-Norway, 22-Algeria, 23-Egypt, 
24-Sweden, 25-Turkey, 26-Ecuador, 27-Paraguay, 28-Canada, 29-South Korea, 30-Australia, 
31-Tunisia, 32-Ghana, 33-Saudi Arabia, 34-Panama, 35-Qatar, 36-Ivory Coast, 37-Scotland, 
38-South Africa, 39-Bosnia, 40-Czech Republic, 41-Jordan, 42-Uzbekistan, 43-Iraq, 44-DR Congo, 
45-Haiti, 46-Curacao, 47-New Zealand, 48-New Caledonia`

const TEAM_STRENGTHS = `
Team strengths and notes:
- France (#1): Defending finalist, Mbappe-led, strongest squad overall
- Spain (#2): Young talent, tiki-taka evolution, 2010 champion
- Argentina (#3): Defending champion 2022, Messi last World Cup, very motivated
- England (#4): Strong squad, 1966 champion, always contender
- Portugal (#5): Ronaldo era ending, strong collective now
- Brazil (#6): 5x champion, always candidate, attacking football
- Netherlands (#7): Never won, Total Football tradition, strong generation
- Belgium (#8): Golden generation fading, still competitive
- Morocco (#9): African semifinalist 2022, solid defense, huge upset potential
- Germany (#10): 4x champion, rebuilding but dangerous in tournaments
- Colombia (#12): Creative technical football
- Uruguay (#13): Garra uruguaya, 2x champion, punches above weight
- Mexico (#14): Azteca atmosphere, struggles past Round of 16
- USA (#15): Host nation boost, young talented squad
- Japan (#18): Most consistent Asian team, disciplined
- South Korea (#29): 2002 semifinalist, intense physicality
- Saudi Arabia (#33): Shocked Argentina 2022, massive investment
- New Caledonia (#48): Historic debut, weakest team`

// Genera un perfil de personalidad único basado en el usuario
function buildUserPersonality(profile: any, pastPredictions: any[]): string {
  const favoriteTeam = profile.favorite_team || 'Unknown'
  const country = profile.country_of_residence || 'Unknown'
  const username = profile.username || 'user'

  // Analizar historial de predicciones si existe
  let predStyle = ''
  if (pastPredictions.length > 0) {
    const homeWins = pastPredictions.filter(p => p.predicted_home_score > p.predicted_away_score).length
    const draws = pastPredictions.filter(p => p.predicted_home_score === p.predicted_away_score).length
    const awayWins = pastPredictions.filter(p => p.predicted_home_score < p.predicted_away_score).length
    const avgGoals = pastPredictions.reduce((acc, p) => acc + (p.predicted_home_score || 0) + (p.predicted_away_score || 0), 0) / pastPredictions.length

    predStyle = `
PAST PREDICTION STYLE of ${username}:
- Tends to predict: ${homeWins > awayWins ? 'home team wins' : awayWins > homeWins ? 'away team wins' : 'balanced'}
- Draw frequency: ${draws > pastPredictions.length * 0.3 ? 'likes draws' : 'avoids draws'}
- Average goals per match predicted: ${avgGoals.toFixed(1)} (${avgGoals > 3 ? 'high scorer, loves attacking football' : avgGoals < 2 ? 'defensive mindset, low scoring' : 'balanced scorer'})
- Incorporate these tendencies but add unique variation`
  }

  // Sesgo por país de residencia
  const countryBias: Record<string, string> = {
    'Argentina': 'STRONG bias towards Argentina winning. Also favors South American teams.',
    'Colombia': 'Bias towards Colombia and South American teams. Believes in underdogs.',
    'United States': 'Believes USA can go far as hosts. Favors North American teams.',
    'Mexico': 'Strong belief in Mexico surprising everyone. Favors CONCACAF teams.',
    'Brazil': 'Brazil ultranationalist, believes Brazil will win the World Cup.',
    'Spain': 'Believes Spanish football is still the best. Favors European teams.',
    'France': 'France to repeat as champions. European football dominance.',
    'England': 'Football is coming home energy. England will finally win.',
  }

  // Sesgo por equipo favorito
  const teamBias = `ALWAYS predicts ${favoriteTeam} to win their matches, even against strong opponents. Shows emotional attachment to ${favoriteTeam}.`

  // Seed aleatorio único por usuario para variación
  const randomSeed = parseInt(profile.id?.replace(/-/g, '').slice(0, 8), 16) % 100

  const personalityTypes = [
    'optimistic romantic who believes in fairytale stories and upsets',
    'cold statistical analyst who follows FIFA rankings strictly',
    'passionate fan who lets emotions guide predictions',
    'contrarian who loves to pick underdogs and surprise results',
    'conservative predictor who favors favorites but with tight scorelines',
    'attacking football lover who predicts high-scoring matches',
    'defensive football believer who predicts 1-0 and 0-0 results',
    'historical analyst who values World Cup pedigree above all',
  ]
  const personality = personalityTypes[randomSeed % personalityTypes.length]

  return `
UNIQUE PREDICTOR IDENTITY for @${username}:
- Personality type: ${personality}
- Favorite team: ${favoriteTeam} — ${teamBias}
- Country: ${country} — ${countryBias[country] || 'Neutral global perspective'}
- Unique variation seed: ${randomSeed} — use this to slightly offset scores and winners from typical predictions
${predStyle}

CRITICAL: These predictions must feel UNIQUE to ${username}. They should NOT match predictions generated for other users. Apply the personality consistently across all matches.`
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zjlaabrqfjtvbtbvoaic.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Traer perfil completo del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits, username, favorite_team, country_of_residence, id')
      .eq('id', userId)
      .single()

    if (!profile) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    if ((profile.credits || 0) < ORACLE_FILL_COST) {
      return NextResponse.json({ error: `Necesitás $${ORACLE_FILL_COST} créditos. Tenés ${profile.credits || 0}.` }, { status: 400 })
    }

    // Traer historial de predicciones pasadas del usuario
    const { data: pastPredictions } = await supabase
      .from('predictions')
      .select('predicted_home_score, predicted_away_score, predicted_winner')
      .eq('user_id', userId)
      .limit(20)

    const { data: matches } = await supabase
      .from('matches')
      .select('id, home_team, away_team, match_date, stage, group_name')
      .order('match_date', { ascending: true })

    if (!matches || matches.length === 0) {
      return NextResponse.json({ error: 'No hay partidos disponibles' }, { status: 400 })
    }

    const now = new Date()
    const upcomingMatches = matches.filter(m => new Date(m.match_date) > now)

    if (upcomingMatches.length === 0) {
      return NextResponse.json({ error: 'No hay partidos próximos para predecir' }, { status: 400 })
    }

    // Construir identidad única del usuario
    const userPersonality = buildUserPersonality(profile, pastPredictions || [])

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const BATCH_SIZE = 16
    const allPredictions: any[] = []

    for (let i = 0; i < upcomingMatches.length; i += BATCH_SIZE) {
      const batch = upcomingMatches.slice(i, i + BATCH_SIZE)
      const matchList = batch.map(m =>
        `${m.id}|${m.home_team} vs ${m.away_team}|${m.stage}|Group:${m.group_name || 'KO'}`
      ).join('\n')

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 6000,
        messages: [{
          role: 'user',
          content: `You are The Oracle of World Cup 2026. You generate PERSONALIZED predictions for each user based on their unique identity and football personality.

${FIFA_RANKING}

${TEAM_STRENGTHS}

${userPersonality}

PREDICTION RULES:
- Apply the user's personality and biases consistently
- Vary scorelines realistically: 1-0, 2-0, 2-1, 3-1, 1-1, 0-0, 3-0, 4-1
- Their favorite team ALWAYS wins their matches in this user's predictions
- Upsets should reflect their personality (contrarian = more upsets, conservative = fewer)
- First half goals: 0-2, second half: 0-3
- Make these predictions feel authentically from THIS specific person

Matches (ID|teams|stage|group):
${matchList}

Reply ONLY with valid JSON array, NO markdown:
[{"match_id":"uuid","predicted_winner":"exact team name or Empate","predicted_home_score":2,"predicted_away_score":0,"predicted_first_half_goals":1,"predicted_second_half_goals":1,"predicted_penalties":false}]`
        }]
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
      const clean = text.replace(/```json|```/g, '').trim()

      const startIdx = clean.indexOf('[')
      const endIdx = clean.lastIndexOf('}]')
      if (startIdx === -1) continue

      let jsonStr = endIdx > startIdx ? clean.slice(startIdx, endIdx + 2) : clean.slice(startIdx)

      try {
        const batchPreds = JSON.parse(jsonStr)
        allPredictions.push(...batchPreds)
      } catch {
        try {
          const partial = jsonStr.slice(0, jsonStr.lastIndexOf('}') + 1) + ']'
          const batchPreds = JSON.parse(partial)
          allPredictions.push(...batchPreds)
        } catch {
          console.error('Could not parse batch', i)
        }
      }
    }

    if (allPredictions.length === 0) {
      return NextResponse.json({ error: 'El Oráculo no pudo generar predicciones' }, { status: 500 })
    }

    let savedCount = 0
    for (const pred of allPredictions) {
      if (!pred.match_id || !pred.predicted_winner) continue
      const { error } = await supabase
        .from('predictions')
        .upsert({
          user_id: userId,
          match_id: pred.match_id,
          predicted_winner: pred.predicted_winner,
          predicted_home_score: pred.predicted_home_score ?? 1,
          predicted_away_score: pred.predicted_away_score ?? 0,
          predicted_scorers: [],
          predicted_first_half_goals: pred.predicted_first_half_goals ?? 0,
          predicted_second_half_goals: pred.predicted_second_half_goals ?? 1,
          predicted_penalties: pred.predicted_penalties || false,
          late_fee: 0,
          filled_at: new Date().toISOString(),
        }, { onConflict: 'user_id,match_id' })
      if (!error) savedCount++
    }

    const newCredits = (profile.credits || 0) - ORACLE_FILL_COST
    await supabase.from('profiles').update({ credits: newCredits }).eq('id', userId)
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: -ORACLE_FILL_COST,
      type: 'oracle_fill',
      description: `🔮 Oráculo llenó la polla (${savedCount} partidos)`,
      balance_after: newCredits,
    })

    return NextResponse.json({ success: true, savedCount, creditsLeft: newCredits })

  } catch (err) {
    console.error('Oracle fill error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
