import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { type, homeTeam, awayTeam, team, question, history } = await req.json()

    let prompt = ''

    if (type === 'stats') {
      prompt = `Eres un experto en fútbol mundial. Analizá el partido ${homeTeam} vs ${awayTeam} para el Mundial 2026 respondiendo estas 3 preguntas:

1. ¿Cuántas veces se enfrentaron históricamente y cuáles fueron los resultados más recientes?
2. ¿Cuáles fueron los últimos 5 resultados de cada selección?
3. ¿Quién es el jugador más valioso de cada equipo para este Mundial?

Respondé en español, de forma directa y entretenida. Usá datos reales. Máximo 350 palabras total.`
    } else if (type === 'team') {
      prompt = `Eres un experto en fútbol mundial. Dame info clave sobre ${team} para el Mundial 2026:
- Rendimiento reciente (últimos 5 partidos)
- Jugadores clave y su forma actual
- Sistema de juego y estilo
- Chances reales en el torneo y hasta dónde pueden llegar

Respondé en español, directo y entretenido. Máximo 250 palabras.`
    } else if (type === 'chat') {
      const messages = [
        ...(history || []),
        { role: 'user', content: question }
      ]

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `Eres un experto en fútbol mundial especializado en el Mundial 2026. El usuario está preguntando sobre ${team}. Respondé en español, de forma directa, entretenida y con datos concretos. Máximo 200 palabras por respuesta.`,
          messages,
        }),
      })

      const data = await response.json()
      const text = data.content?.[0]?.text || 'No pude obtener información.'
      return NextResponse.json({ answer: text })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || 'No pude obtener información.'
    return NextResponse.json({ answer: text })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
