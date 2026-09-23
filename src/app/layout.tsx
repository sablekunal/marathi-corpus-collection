import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Serif_Devanagari } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toast'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
})

const noto = Noto_Serif_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-marathi',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://marathi-corpus.vercel.app'),
  title: {
    default: 'मराठी भाषा संग्रह | Marathi Corpus Collection',
    template: '%s | मराठी भाषा संग्रह',
  },
  description:
    'मराठी भाषेच्या संगणकीय प्रक्रियेसाठी मजकूर डेटासंच संकलन व्यासपीठ. A specialized platform for collecting Marathi text corpus for LLM research.',
  keywords: ['Marathi', 'corpus', 'NLP', 'LLM', 'language', 'data collection'],
  authors: [{ name: 'Marathi Corpus Research Team' }],
  openGraph: {
    title: 'मराठी भाषा संग्रह | Marathi Corpus Collection',
    description: 'मराठी भाषेच्या संगणकीय प्रक्रियेसाठी मजकूर डेटासंच संकलन व्यासपीठ. Participate in building the future of Marathi AI.',
    url: 'https://marathi-corpus.vercel.app',
    siteName: 'मराठी भाषा संग्रह',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Marathi Language Corpus - AI Research Project',
      },
    ],
    locale: 'mr_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'मराठी भाषा संग्रह | Marathi Corpus Collection',
    description: 'मराठी भाषेच्या संगणकीय प्रक्रियेसाठी मजकूर डेटासंच संकलन व्यासपीठ.',
    images: ['/logo.png'],
  },
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
    <html lang="mr" translate="no" className="notranslate" suppressHydrationWarning>
      <body className={`${inter.variable} ${noto.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
