import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toast'

export const metadata: Metadata = {
  title: {
    default: 'मराठी भाषा संग्रह | Marathi Corpus Collection',
    template: '%s | मराठी भाषा संग्रह',
  },
  description:
    'मराठी भाषेच्या संगणकीय प्रक्रियेसाठी मजकूर डेटासंच संकलन व्यासपीठ. A specialized platform for collecting Marathi text corpus for LLM research.',
  keywords: ['Marathi', 'corpus', 'NLP', 'LLM', 'language', 'data collection'],
  authors: [{ name: 'Marathi Corpus Research Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'मराठी भाषा संग्रह',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3b5fa0',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="mr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Serif+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
