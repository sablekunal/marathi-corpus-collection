import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toast'
import Link from 'next/link'

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
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="mr" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${noto.className} ${inter.variable} ${noto.variable} font-sans leading-relaxed antialiased bg-[#FAFAFA] text-slate-900 min-h-screen flex flex-col`}>
        
        {/* Universal Top Navbar */}
        <header className="sticky top-0 z-50 h-[54px] w-full bg-white/90 backdrop-blur border-b border-slate-200 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="मभस" className="w-7 h-7 rounded-lg object-cover" />
            <span className="font-bold text-slate-900 text-[15px]">मराठी भाषा संग्रह</span>
            <span className="ml-1 text-[10px] sm:text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">CC BY 4.0</span>
          </div>
          <nav className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="text-[13px] sm:text-[14px] font-medium text-slate-600 hover:text-orange-600 transition-colors">मुख्यपृष्ठ</Link>
            <Link href="/contact" className="text-[13px] sm:text-[14px] font-medium text-slate-600 hover:text-orange-600 transition-colors">Contact</Link>
            <Link href="/privacy" className="text-[13px] sm:text-[14px] font-medium text-slate-600 hover:text-orange-600 transition-colors">Privacy</Link>
            <Link href="/admin" className="text-[13px] sm:text-[14px] font-medium text-slate-600 hover:text-orange-600 transition-colors">Admin</Link>
          </nav>
        </header>

        {/* Page Content */}
        <div className="flex-1 flex flex-col w-full">
          {children}
        </div>
        <Toaster />

        {/* Universal Bottom Footer */}
        <footer className="w-full py-6 px-4 mt-auto border-t border-slate-200 bg-slate-50">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[12px] sm:text-[13px] text-slate-500 font-medium">
              CC-BY-4.0 License • मराठी भाषा संग्रह Research Team
            </div>
            <div className="flex items-center gap-4 text-[12px] sm:text-[13px] font-medium text-slate-500">
              <Link href="/contact" className="hover:text-slate-800 transition-colors">Contact</Link>
              <Link href="/privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</Link>
              <Link href="/admin" className="hover:text-slate-800 transition-colors">Admin Portal</Link>
            </div>
          </div>
        </footer>

      </body>
    </html>
  )
}
