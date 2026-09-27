'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function PublicFooter() {
  const pathname = usePathname()

  // Do not render public footer on admin or auth routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) {
    return null
  }

  return (
    <footer className="w-full py-5 px-4 mt-auto border-t border-slate-200 bg-slate-50">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-[12px] sm:text-[13px] text-slate-500 font-medium">
          CC-BY-4.0 License • मराठी भाषा संग्रह Research Team
        </div>
        <div className="flex items-center gap-4 text-[12px] sm:text-[13px] font-medium text-slate-500">
          <Link href="/contact" className="hover:text-slate-800 transition-colors">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-slate-800 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
