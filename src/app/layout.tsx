import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toast'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { PublicFooter } from '@/components/layout/PublicFooter'

const noto = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-marathi',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://marathi-corpus.vercel.app'),
  title: 'मराठी भाषा संग्रह | Marathi Language Corpus',
  description: 'मराठी भाषेच्या संगणकीय प्रक्रियेसाठी मजकूर डेटासंच संकलन व्यासपीठ.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#EA580C',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="mr" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${noto.className} ${inter.variable} ${noto.variable} font-sans leading-relaxed antialiased bg-[#FAFAFA] text-slate-900 min-h-screen flex flex-col`}
      >
        <PublicHeader />

        {/* Page Content */}
        <div className="flex-1 flex flex-col w-full">{children}</div>

        <Toaster />

        <PublicFooter />
      </body>
    </html>
  )
}
