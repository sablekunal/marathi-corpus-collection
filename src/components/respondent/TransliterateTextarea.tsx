'use client'

import React, { useState, useRef, useEffect } from 'react'
import { romanToMarathi } from '@/lib/transliteration/mapper'
import { Languages, ShieldAlert, Sparkles } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

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
  transliterationDefault = true,
  antiPasteEnabled = true,
  placeholder = 'येथे तुमचे उत्तर मराठीत लिहा... (उदा. "namaste" टाईप केल्यास "नमस्ते" होईल)',
}: TransliterateTextareaProps) {
  const [isTransliterationOn, setIsTransliterationOn] = useState(transliterationDefault)
  const [pasteWarning, setPasteWarning] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Metrics tracking state
  const startTimeRef = useRef<number>(Date.now())
  const lastKeyTimeRef = useRef<number>(Date.now())
  const activeDurationRef = useRef<number>(0)
  const idleDurationRef = useRef<number>(0)
  const keyPressCountRef = useRef<number>(0)

  // Active / Idle timer loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastKey = now - lastKeyTimeRef.current

      if (timeSinceLastKey < 2500 && keyPressCountRef.current > 0) {
        activeDurationRef.current += 1000
      } else if (keyPressCountRef.current > 0) {
        idleDurationRef.current += 1000
      }

      const totalDuration = now - startTimeRef.current
      const words = value.trim().split(/\s+/).filter(w => w.length > 0).length
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

  // Handle keyboard input & real-time transliteration
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawVal = e.target.value
    lastKeyTimeRef.current = Date.now()
    keyPressCountRef.current += 1

    if (!isTransliterationOn) {
      onChange(rawVal)
      return
    }

    // Convert roman to marathi
    const converted = romanToMarathi(rawVal)
    onChange(converted)
  }

  // Anti-paste prevention
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
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-2">
          <Languages className="w-3.5 h-3.5 text-slate-500" />
          <Label htmlFor="transliterate-toggle" className="text-xs text-slate-600 font-medium cursor-pointer">
            मराठी टायपिंग सहाय्यक (Transliteration)
          </Label>
          <Switch
            id="transliterate-toggle"
            checked={isTransliterationOn}
            onCheckedChange={setIsTransliterationOn}
            className="scale-75 origin-left"
          />
        </div>

        {isTransliterationOn && (
          <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            सक्रिय: &quot;namaskar&quot; → &quot;नमस्कार&quot;
          </span>
        )}
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onContextMenu={antiPasteEnabled ? (e) => {
            // Optional: allow context menu for spell check but warn if paste was targeted
          } : undefined}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full min-h-[160px] p-4 text-base md:text-lg font-marathi leading-relaxed text-slate-800 bg-white border border-[oklch(0.88_0.02_250)] rounded-xl shadow-inner focus:outline-hidden focus:ring-2 focus:ring-[oklch(0.42_0.16_250)] focus:border-transparent transition-all placeholder:font-sans placeholder:text-slate-400 placeholder:text-sm resize-y"
          style={{ fontFeatureSettings: '"kern" 1, "liga" 1' }}
        />

        {pasteWarning && (
          <div className="absolute bottom-3 left-3 right-3 bg-amber-500/95 text-white text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-lg animate-fade-in-up backdrop-blur-xs">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              गुणवत्तेच्या खात्रीसाठी कृपया मजकूर पेस्ट न करता स्वतः मराठीत टाईप करा.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
