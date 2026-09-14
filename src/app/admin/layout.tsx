'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  BookOpen,
  LayoutDashboard,
  HelpCircle,
  FileText,
  BarChart3,
  Download,
  MessageSquare,
  LogOut,
  Menu,
  X,
  BookType,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/questions', label: 'Questions', icon: HelpCircle },
  { href: '/admin/forms', label: 'Forms', icon: FileText },
  { href: '/admin/responses', label: 'Responses', icon: MessageSquare },
  { href: '/admin/dictionary', label: 'Dictionary', icon: BookType },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/export', label: 'Export', icon: Download },
]

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col h-full bg-white border-r border-[oklch(0.88_0.02_250)] w-64">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[oklch(0.88_0.02_250)]">
        <div className="w-8 h-8 bg-[oklch(0.42_0.16_250)] rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="font-marathi font-bold text-sm text-[oklch(0.20_0.04_250)] leading-tight">
            मराठी भाषा संग्रह
          </div>
          <div className="text-[10px] text-[oklch(0.52_0.04_250)] uppercase tracking-wide">
            Admin
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-[oklch(0.52_0.04_250)]">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-[oklch(0.93_0.03_250)] text-[oklch(0.35_0.14_250)]'
                  : 'text-[oklch(0.45_0.04_250)] hover:bg-[oklch(0.96_0.01_250)] hover:text-[oklch(0.20_0.04_250)]',
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-[oklch(0.42_0.16_250)]' : '')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-[oklch(0.88_0.02_250)]">
        <button
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[oklch(0.52_0.04_250)] hover:text-[oklch(0.58_0.22_27)] hover:bg-[oklch(0.97_0.05_27)] w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[oklch(0.97_0.01_250)]">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex admin-sidebar flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-[oklch(0.88_0.02_250)] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[oklch(0.45_0.04_250)] hover:text-[oklch(0.20_0.04_250)] transition-colors p-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-marathi font-bold text-sm text-[oklch(0.20_0.04_250)]">
            मराठी भाषा संग्रह
          </span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
