import type { Metadata, Viewport } from 'next'
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
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="font-sans bg-neutral-950 text-white antialiased">
        {children}
      </body>
    </html>
  )
}
