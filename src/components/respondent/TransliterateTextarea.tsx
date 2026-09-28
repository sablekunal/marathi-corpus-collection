'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ShieldAlert } from 'lucide-react'

interface TransliterateTextareaProps {
  value: string
  onChange: (value: string) => void
  onPasteAttempt?: () => void
  onMetricsUpdate?: (metrics: {
    totalDurationMs: number
    activeDurationMs: number
    idleDurationMs: number
    wordsTyped: number
    charsTyped: number
    typingSpeedWpm: number
  }) => void
  disabled?: boolean
  transliterationDefault?: boolean
  antiPasteEnabled?: boolean
  placeholder?: string
  minWords?: number
}

export function TransliterateTextarea({
  value,
  onChange,
  onPasteAttempt,
  onMetricsUpdate,
  disabled = false,
  antiPasteEnabled = true,
  placeholder = 'येथे तुमचे उत्तर लिहा... (मराठी किंवा "mla aamba vadto" सारख्या रोमन लिपीतही चालेल)',
}: TransliterateTextareaProps) {
  const [pasteWarning, setPasteWarning] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Metrics tracking state
  const startTimeRef = useRef<number>(0)
  const lastKeyTimeRef = useRef<number>(0)
  const activeDurationRef = useRef<number>(0)
  const idleDurationRef = useRef<number>(0)
  const keyPressCountRef = useRef<number>(0)

  // ── Metrics Loop (Active / Idle duration & WPM calculation) ─
  useEffect(() => {
    if (startTimeRef.current === 0) startTimeRef.current = Date.now()
    if (lastKeyTimeRef.current === 0) lastKeyTimeRef.current = Date.now()

    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastKey = now - lastKeyTimeRef.current

      if (timeSinceLastKey < 2500 && keyPressCountRef.current > 0) {
        activeDurationRef.current += 1000
      } else if (keyPressCountRef.current > 0) {
        idleDurationRef.current += 1000
      }

      const totalDuration = now - startTimeRef.current
      const words = value.trim().split(/\s+/).filter((w) => w.length > 0).length
      const chars = value.length
      const minutes = Math.max(activeDurationRef.current / 60000, 0.1)
      const wpm = Math.round(words / minutes)

      if (onMetricsUpdate && (activeDurationRef.current > 0 || keyPressCountRef.current > 0)) {
        onMetricsUpdate({
          totalDurationMs: totalDuration,
          activeDurationMs: activeDurationRef.current,
          idleDurationMs: idleDurationRef.current,
          wordsTyped: words,
          charsTyped: chars,
          typingSpeedWpm: isNaN(wpm) ? 0 : wpm,
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [value, onMetricsUpdate])

  // ── Keydown & Change Handlers ────────────────────────────────
  const handleKeyDown = () => {
    lastKeyTimeRef.current = Date.now()
    keyPressCountRef.current += 1
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    lastKeyTimeRef.current = Date.now()
    keyPressCountRef.current += 1
    // Accept input directly as typed (Devanagari or Roman/English without forced conversion)
    onChange(e.target.value)
  }

  // ── Anti-paste Prevention ───────────────────────────────────
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (antiPasteEnabled) {
      e.preventDefault()
      setPasteWarning(true)
      if (onPasteAttempt) onPasteAttempt()
      setTimeout(() => setPasteWarning(false), 4000)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    if (antiPasteEnabled) {
      e.preventDefault()
      setPasteWarning(true)
      if (onPasteAttempt) onPasteAttempt()
      setTimeout(() => setPasteWarning(false), 4000)
    }
  }

  return (
    <div className="space-y-1.5 w-full">
      {/* Textarea Input */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onDrop={handleDrop}
          disabled={disabled}
          placeholder={placeholder}
          rows={3}
          className="w-full min-h-[105px] max-h-[180px] p-3 text-sm font-sans leading-relaxed text-slate-900 bg-white border border-slate-300 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-slate-400 placeholder:text-xs sm:placeholder:text-sm resize-none"
        />

        {/* Anti-paste Warning Popup */}
        {pasteWarning && (
          <div className="absolute bottom-3 left-3 right-3 bg-amber-500/95 text-white text-xs sm:text-sm px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-lg animate-fade-in-up backdrop-blur-xs z-20">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              गुणवत्तेच्या खात्रीसाठी कृपया मजकूर पेस्ट न करता स्वतः टाईप करा.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
