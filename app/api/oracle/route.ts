import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { question, matchId, userId } = await req.json()

    if (!question || !userId) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    )

    // Verificar cuántas consultas tiene este usuario
    const { count } = await supabaseAdmin
      .from('oracle_queries')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    if ((count || 0) >= 12) {
      return NextResponse.json({ error: 'limite' }, { status: 403 })
    }

    // Llamar a Claude con contexto especializado
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
        system: `Eres El Oráculo del Mundial 2026 — un analista estadístico y matemático de élite especializado en fútbol internacional.

Tu rol es dar predicciones y análisis basados en:
- Historial de enfrentamientos entre selecciones
- Estadísticas recientes (últimos 10-20 partidos de cada equipo)
- Rendimiento en torneos importantes (Mundiales, Copas Continentales)
- Estilo de juego, formaciones y jugadores clave
- Factores externos (sede, clima, presión, etc.)
- Modelos probabilísticos (ELO, xG histórico, rendimiento defensivo/ofensivo)

REGLAS:
- Siempre dá porcentajes de probabilidad concretos
- Basá todo en datos y estadísticas reales
- Sé directo y concreto — nada de respuestas vagas
- Respondé en español
- Máximo 300 palabras
- Terminá siempre con una predicción clara: quién gana y con qué marcador más probable`,
        messages: [{ role: 'user', content: question }],
      }),
    })

    const data = await response.json()
    console.log('Anthropic response:', JSON.stringify(data).slice(0, 500))
    const answer = data.content?.[0]?.text || 'No pude generar una predicción.'

    // Guardar la consulta
    await supabaseAdmin.from('oracle_queries').insert({
      user_id: userId,
      question,
      response: answer,
      cost: 1.00,
      match_id: matchId || null,
    })

    return NextResponse.json({ answer, queriesUsed: (count || 0) + 1 })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
