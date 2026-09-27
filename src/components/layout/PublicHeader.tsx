'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function PublicHeader() {
  const pathname = usePathname()

  // Do not render public header on admin or auth routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 h-[54px] w-full bg-white/95 backdrop-blur border-b border-slate-200 px-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="मराठी भाषा संग्रह" className="w-7 h-7 rounded-lg object-cover" />
        <span className="font-bold text-slate-900 text-[15px] font-marathi">मराठी भाषा संग्रह</span>
        <span className="ml-1 text-[10px] sm:text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
          CC BY 4.0
        </span>
      </Link>
    </header>
  )
}
