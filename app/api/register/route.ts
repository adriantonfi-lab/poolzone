import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqbGFhYnJxZmp0dmJ0YnZvYWljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODgyNDA3NywiZXhwIjoyMDk0NDAwMDc3fQ.BEq1sbAj87kbPAb8a6yPBvx2N7_GxPgye2fQSkCdEbY'
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY)

    const formData = await req.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string
    const fullName = (formData.get('fullName') as string) || ''
    const country = formData.get('country') as string
    const favoriteTeam = formData.get('favoriteTeam') as string
    const avatar = formData.get('avatar') as File | null

    if (!email || !password || !username) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    // 1. Crear usuario
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, full_name: fullName, country, favorite_team: favoriteTeam }
    })

    if (userError || !userData?.user?.id) {
      return NextResponse.json({ error: userError?.message || 'Error al crear usuario' }, { status: 400 })
    }

    const userId = userData.user.id
    let avatarUrl: string | null = null

    console.log('=== REGISTER DEBUG ===')
    console.log('userId:', userId)
    console.log('avatar exists:', !!avatar)
    console.log('avatar size:', avatar?.size)

    // 2. Subir foto
    if (avatar && avatar.size > 0) {
      const arrayBuffer = await avatar.arrayBuffer()
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('avatars')
        .upload(`${userId}/avatar.jpg`, arrayBuffer, { contentType: 'image/jpeg', upsert: true })

      console.log('uploadData:', uploadData)
      console.log('uploadError:', uploadError)

      if (!uploadError && uploadData) {
        const { data: urlData } = supabaseAdmin.storage
          .from('avatars')
          .getPublicUrl(uploadData.path)
        avatarUrl = urlData.publicUrl
      }
    }

    console.log('avatarUrl final:', avatarUrl)

    // 3. Esperar que el trigger cree el perfil
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 4. Upsert
    const { data: upsertData, error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        username,
        full_name: fullName,
        avatar_url: avatarUrl,
        country_of_residence: country,
        favorite_team: favoriteTeam,
      }, { onConflict: 'id' })
      .select()

    console.log('upsertData:', upsertData)
    console.log('upsertError:', upsertError)
    console.log('=== FIN DEBUG ===')

    if (upsertError) {
      return NextResponse.json({ error: 'Error al guardar perfil' }, { status: 500 })
    }

    return NextResponse.json({ success: true, userId })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
