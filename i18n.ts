import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
  let locale = 'es'
  let messages = {}

  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    locale = cookieStore.get('locale')?.value || 'es'
  } catch {
    locale = 'es'
  }

  try {
    messages = (await import(`./messages/${locale}.json`)).default
  } catch {
    try {
      messages = (await import('./messages/es.json')).default
    } catch {
      messages = {}
    }
  }

  return { locale, messages }
})
