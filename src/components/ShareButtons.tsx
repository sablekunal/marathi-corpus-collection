'use client'

import { useState, useEffect } from 'react'
import { Share2, Copy, Check, MessageCircle } from 'lucide-react'

interface ShareButtonsProps {
  /** The full URL to share. Falls back to current page origin + default form path. */
  formUrl?: string
  /** Compact mode for inline use (e.g., completion screen). */
  compact?: boolean
}

/**
 * Viral sharing component with WhatsApp (primary), Web Share API,
 * Copy Link, and LinkedIn buttons.
 *
 * Used on: Homepage, Completion Screen, Stats page.
 */
export function ShareButtons({ formUrl, compact = false }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [isNativeShareSupported, setIsNativeShareSupported] = useState(false)
  const [url, setUrl] = useState(formUrl || '')

  useEffect(() => {
    // Determine the URL on the client to avoid hydration mismatch
    if (!formUrl) {
      setUrl(`${window.location.origin}/f/marathi-pilot-2026`)
    }
    
    // Check if native share is supported on the client
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setIsNativeShareSupported(true)
    }
  }, [formUrl])

  const marathiShareMessage =
    'मी मराठी भाषा संवर्धन व AI प्रकल्पात सहभाग नोंदवून माझी बोलीभाषा नोंदवली आहे. आपणही ५ मिनिटांत सहभाग नोंदवून मराठी भाषेच्या संवर्धनास हातभार लावा: ' + url

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleNativeShare = async () => {
    if (isNativeShareSupported) {
      try {
        await navigator.share({
          title: 'मराठी भाषा संग्रह — Marathi Corpus Collection',
          text: marathiShareMessage,
          url,
        })
      } catch {
        // User cancelled — ignore
      }
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(marathiShareMessage)}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 bg-slate-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors shadow-sm"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

        {/* Native Share (mobile) */}
        {isNativeShareSupported && (
          <button
            onClick={handleNativeShare}
            className="inline-flex items-center gap-1.5 bg-[oklch(0.42_0.16_250)] text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-[oklch(0.35_0.14_250)] transition-colors shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-800">
        📢 मित्र आणि कुटुंबीयांना शेअर करा:
      </p>
      <div className="flex flex-wrap gap-2.5">
        {/* WhatsApp — Primary CTA */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp वर शेअर करा
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-200 border border-slate-200 transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          {copied ? 'लिंक कॉपी झाली!' : 'लिंक कॉपी करा'}
        </button>

        {/* LinkedIn */}
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 transition-all shadow-sm"
        >
          LinkedIn
        </a>

        {/* Native Share (shows only on mobile devices that support it) */}
        {isNativeShareSupported && (
          <button
            onClick={handleNativeShare}
            className="inline-flex items-center gap-2 bg-[oklch(0.42_0.16_250)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[oklch(0.35_0.14_250)] transition-all shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            इतर अॅप्स
          </button>
        )}
      </div>
    </div>
  )
}
