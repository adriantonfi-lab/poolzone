import type { Metadata } from 'next'
import './(app)/globals.css'

export const metadata: Metadata = {
  title: 'PoolZone — World Cup 2026',
  description: 'Quinielas deportivas para latinos en USA. Join the pool, predict matches, win real prizes.',
  openGraph: {
    title: 'PoolZone — World Cup 2026',
    description: 'Join 100+ players competing for real prizes. $30 entry.',
    images: ['/poolzone-banner.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
