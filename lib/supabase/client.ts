'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zjlaabrqfjtvbtbvoaic.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqbGFhYnJxZmp0dmJ0YnZvYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MjQwNzcsImV4cCI6MjA5NDQwMDA3N30.618BMJCo4NlS6D0YG1_I3P0jayg8F1OPlTGSnuFXqZU'
  )
}
