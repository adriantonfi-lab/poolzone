import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const getAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zjlaabrqfjtvbtbvoaic.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function filterContent(text: string, bannedWords: string[]): string {
  let result = text

  for (const word of bannedWords) {
    // Escapar caracteres especiales de regex
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Reemplazar con/sin acentos, case insensitive, con word boundary flexible
    const regex = new RegExp(escaped, 'gi')
    result = result.replace(regex, '***')

    // También probar sin acentos
    const wordNoAccents = removeAccents(word)
    const escapedNoAccents = wordNoAccents.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regexNoAccents = new RegExp(escapedNoAccents, 'gi')
    const resultNoAccents = removeAccents(result)
    
    // Si hay match en versión sin acentos, reemplazar en original
    if (regexNoAccents.test(resultNoAccents)) {
      // Reconstruir reemplazando posiciones
      result = result.replace(new RegExp(escapedNoAccents, 'gi'), '***')
    }
  }

  return result
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, userId, messageId, targetUserId, reason, duration, word, content, channel, mediaUrl, messageType } = body
    const supabase = getAdmin()

    const { data: caller } = await supabase
      .from('profiles').select('role').eq('id', userId).single()

    const isAdmin = caller?.role === 'admin' || caller?.role === 'super_admin'

    // ENVIAR MENSAJE CON FILTRO
    if (action === 'send_message') {
      const now = new Date().toISOString()
      const { data: banData } = await supabase
        .from('user_bans').select('type').eq('user_id', userId)
        .or(`expires_at.is.null,expires_at.gt.${now}`).limit(1)

      const ban = banData?.[0]
      if (ban?.type === 'ban') return NextResponse.json({ error: 'Usuario baneado' }, { status: 403 })
      if (ban?.type === 'mute') return NextResponse.json({ error: 'Usuario silenciado' }, { status: 403 })

      // Cargar palabras prohibidas
      const { data: words } = await supabase.from('banned_words').select('word')
      const wordList = (words || []).map((w: any) => w.word)

      console.log('=== FILTER DEBUG ===')
      console.log('content:', content)
      console.log('wordList count:', wordList.length)

      // Filtrar — ordenar de más larga a más corta para evitar problemas
      const sortedWords = wordList.sort((a: string, b: string) => b.length - a.length)
      const cleanContent = filterContent(content || '', sortedWords)

      console.log('cleanContent:', cleanContent)
      console.log('=== FIN FILTER ===')

      const { data: msg, error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: userId,
          channel: channel || 'general',
          content: cleanContent,
          media_url: mediaUrl || null,
          message_type: messageType || 'text',
          is_system: false,
        })
        .select('*, profiles(username, avatar_url)')
        .single()

      if (insertError) {
        console.error('insertError:', insertError)
        return NextResponse.json({ error: 'Error al enviar mensaje' }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: msg })
    }

    // REPORTAR MENSAJE
    if (action === 'report_message') {
      const { error } = await supabase.from('message_reports').insert({
        message_id: messageId,
        reported_by: userId,
        reason: reason || 'Contenido inapropiado',
        status: 'pending',
      })
      if (error) return NextResponse.json({ error: 'Error al reportar' }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    if (!isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

    if (action === 'delete_message') {
      await supabase.from('chat_messages').delete().eq('id', messageId)
      return NextResponse.json({ success: true })
    }

    if (action === 'mute_user') {
      const hours = duration || 24
      const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
      await supabase.from('user_bans').insert({
        user_id: targetUserId, banned_by: userId, type: 'mute',
        reason: reason || 'Comportamiento inapropiado', expires_at: expiresAt,
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'ban_user') {
      await supabase.from('user_bans').insert({
        user_id: targetUserId, banned_by: userId, type: 'ban',
        reason: reason || 'Violación de reglas', expires_at: null,
      })
      await supabase.from('profiles').update({ is_banned: true }).eq('id', targetUserId)
      return NextResponse.json({ success: true })
    }

    if (action === 'unban_user') {
      await supabase.from('user_bans').delete().eq('user_id', targetUserId)
      await supabase.from('profiles').update({ is_banned: false }).eq('id', targetUserId)
      return NextResponse.json({ success: true })
    }

    if (action === 'resolve_report') {
      await supabase.from('message_reports').update({ status: 'resolved' }).eq('id', messageId)
      return NextResponse.json({ success: true })
    }

    if (action === 'dismiss_report') {
      await supabase.from('message_reports').update({ status: 'dismissed' }).eq('id', messageId)
      return NextResponse.json({ success: true })
    }

    if (action === 'add_banned_word') {
      await supabase.from('banned_words').insert({ word: word.toLowerCase().trim() })
      return NextResponse.json({ success: true })
    }

    if (action === 'remove_banned_word') {
      await supabase.from('banned_words').delete().eq('word', word)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')
    const supabase = getAdmin()

    if (action === 'check_status' && userId) {
      const now = new Date().toISOString()
      const { data } = await supabase
        .from('user_bans').select('*').eq('user_id', userId)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: false }).limit(1)
      const ban = data?.[0]
      return NextResponse.json({
        isBanned: ban?.type === 'ban',
        isMuted: ban?.type === 'mute',
        reason: ban?.reason || null,
        expiresAt: ban?.expires_at || null,
      })
    }

    if (action === 'get_reports') {
      const { data } = await supabase
        .from('message_reports')
        .select('*, chat_messages(content, media_url, sender_id, profiles(username)), profiles(username)')
        .eq('status', 'pending').order('created_at', { ascending: false })
      return NextResponse.json({ reports: data || [] })
    }

    if (action === 'get_banned_words') {
      const { data } = await supabase.from('banned_words').select('*').order('word')
      return NextResponse.json({ words: data || [] })
    }

    if (action === 'get_bans') {
      const now = new Date().toISOString()
      const { data } = await supabase
        .from('user_bans')
        .select('*, profiles!user_bans_user_id_fkey(username, avatar_url)')
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: false })
      return NextResponse.json({ bans: data || [] })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
