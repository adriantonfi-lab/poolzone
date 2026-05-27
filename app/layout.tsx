import type { Metadata } from 'next'
import './(app)/globals.css'

export const metadata: Metadata = {
  title: 'PoolZone — World Cup 2026',
  description: 'Join the World Cup 2026 prediction pool. Pick winners, predict scores, win real cash prizes. $30 entry. For the Latino community in USA.',
  openGraph: {
    title: 'PoolZone — World Cup 2026',
    description: 'Join 100+ players competing for real prizes. $30 entry. Play Together. Win Together.',
    images: [{ url: '/poolzone-banner.png', width: 1200, height: 630, alt: 'PoolZone World Cup 2026' }],
    url: 'https://poolzone.app',
    siteName: 'PoolZone',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PoolZone — World Cup 2026',
    description: 'Join the World Cup 2026 prediction pool. Win real prizes.',
    images: ['/poolzone-banner.png'],
  },
  icons: {
    icon: '/favicon.png',
    apple: '/poolzone-icon.png',
  },
  keywords: ['World Cup 2026', 'prediction pool', 'quiniela', 'soccer pool', 'latinos USA', 'FIFA 2026'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
