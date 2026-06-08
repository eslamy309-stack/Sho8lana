import type { Metadata, Viewport } from 'next'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sho8lana — شغلانة | Internships for Egyptian Students',
  description:
    'Find internships across Egypt, practice real business tasks, and get AI career coaching. Built for Egyptian college students.',
  keywords: ['internships', 'egypt', 'students', 'career', 'شغلانة', 'تدريب'],
}

export const viewport: Viewport = {
  themeColor: '#0D9488',
  width: 'device-width',
  initialScale: 1,
  // No maximumScale — allow pinch-zoom on desktop and for accessibility
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/api/pwa-icon/192" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sho8lana" />
      </head>
      <body className="font-sans bg-neutral-950 text-white antialiased">
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  )
}
