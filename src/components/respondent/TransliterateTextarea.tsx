'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { getFromCache } from '@/lib/transliteration/highFreqCache'
import { romanToMarathi } from '@/lib/transliteration/mapper'
import { Languages, ShieldAlert, Sparkles, Check, Undo2 } from 'lucide-react'
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

// Client-side cache for instant keystroke retrieval (<1ms)
const clientCache = new Map<string, string[]>()

export function TransliterateTextarea({
  value,
  onChange,
  onPasteAttempt,
  onMetricsUpdate,
  disabled = false,
  transliterationDefault = true,
  antiPasteEnabled = true,
  placeholder = 'येथे तुमचे उत्तर मराठीत लिहा... (उदा. "kuthe" टाईप केल्यास "कुठे" होईल)',
}: TransliterateTextareaProps) {
  const [isTransliterationOn, setIsTransliterationOn] = useState(transliterationDefault)
  const [pasteWarning, setPasteWarning] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Active word & candidate state
  const [activeWord, setActiveWord] = useState<string>('')
  const [candidates, setCandidates] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [canUndo, setCanUndo] = useState<boolean>(false)

  // Undo tracking for Backspace: reverts converted Devanagari back to Roman English
  const lastConversionRef = useRef<{
    original: string
    converted: string
    startIndex: number
    endIndex: number
  } | null>(null)

  // Metrics tracking state
  const startTimeRef = useRef<number>(0)
  const lastKeyTimeRef = useRef<number>(0)
  const activeDurationRef = useRef<number>(0)
  const idleDurationRef = useRef<number>(0)
  const keyPressCountRef = useRef<number>(0)

  // ── Metrics Loop (Active / Idle duration) ───────────────────
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

  // ── Candidate Fetcher (3-Tier: Client Cache -> HighFreqCache -> API) ──
  const fetchCandidates = useCallback(async (word: string) => {
    const trimmed = word.trim()
    if (!trimmed || !/^[a-zA-Z]+$/.test(trimmed)) {
      setCandidates([])
      return
    }

    const lower = trimmed.toLowerCase()

    // 1. Check local in-memory client cache
    if (clientCache.has(lower)) {
      setCandidates(clientCache.get(lower)!)
      setSelectedIndex(0)
      return
    }

    // 2. Check 300-word high frequency dictionary
    const cached = getFromCache(lower)
    if (cached && cached.length > 0) {
      clientCache.set(lower, cached)
      setCandidates(cached)
      setSelectedIndex(0)
      return
    }

    // 3. Fallback preview immediately with local rules while querying API
    const instantFallback = romanToMarathi(trimmed)
    setCandidates([instantFallback, trimmed])

    // Query /api/transliterate with debounce
    try {
      const res = await fetch(`/api/transliterate?text=${encodeURIComponent(trimmed)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
          // Include original english word as the last option
          const fullCandidates = Array.from(new Set([...data.candidates, trimmed]))
          clientCache.set(lower, fullCandidates)
          setCandidates(fullCandidates)
          setSelectedIndex(0)
        }
      }
    } catch {
      // Fallback already rendered
    }
  }, [])

  // ── Extract Active Word Under Caret ─────────────────────────
  const updateActiveWord = useCallback(() => {
    if (!textareaRef.current || !isTransliterationOn) {
      setActiveWord('')
      setCandidates([])
      return
    }

    const el = textareaRef.current
    const pos = el.selectionStart
    const textBefore = el.value.slice(0, pos)

    // Extract Latin characters right before cursor
    const match = textBefore.match(/([a-zA-Z]+)$/)
    if (match) {
      const currentWord = match[1]
      setActiveWord(currentWord)
      fetchCandidates(currentWord)
    } else {
      setActiveWord('')
      setCandidates([])
    }
  }, [isTransliterationOn, fetchCandidates])

  // ── Commit Candidate to Textarea ────────────────────────────
  const commitCandidate = useCallback(
    (candidate: string, trailingDelimiter: string = ' ') => {
      if (!textareaRef.current) return

      const el = textareaRef.current
      const pos = el.selectionStart
      const text = el.value
      const textBefore = text.slice(0, pos)
      const textAfter = text.slice(pos)

      // Find the start of the word being replaced
      const match = textBefore.match(/([a-zA-Z]+)$/)
      if (!match) return

      const wordToReplace = match[1]
      const startIndex = textBefore.length - wordToReplace.length
      const newText = text.slice(0, startIndex) + candidate + trailingDelimiter + textAfter
      const newCursorPos = startIndex + candidate.length + trailingDelimiter.length

      // Save for backspace undo
      lastConversionRef.current = {
        original: wordToReplace,
        converted: candidate,
        startIndex,
        endIndex: startIndex + candidate.length + trailingDelimiter.length,
      }
      setCanUndo(true)

      onChange(newText)
      setActiveWord('')
      setCandidates([])

      // Restore cursor position after DOM update
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = newCursorPos
          textareaRef.current.selectionEnd = newCursorPos
          textareaRef.current.focus()
        }
      })
    },
    [onChange],
  )

  // ── Keydown Interceptor (Spacebar, Enter, Backspace, Ctrl+G) ─
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    lastKeyTimeRef.current = Date.now()
    keyPressCountRef.current += 1

    // Toggle shortcut: Ctrl + G
    if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')) {
      e.preventDefault()
      setIsTransliterationOn(prev => !prev)
      return
    }

    if (!isTransliterationOn) return

    // 1. Space or Punctuation Auto-Commit
    const isCommitKey = e.key === ' ' || e.key === 'Enter' || e.key === ',' || e.key === '.' || e.key === '?' || e.key === '!'
    if (isCommitKey && activeWord && candidates.length > 0) {
      e.preventDefault()
      const chosen = candidates[selectedIndex] || candidates[0] || activeWord
      const delimiter = e.key === 'Enter' ? '\n' : e.key
      commitCandidate(chosen, delimiter)
      return
    }

    // 2. Number keys (1–5) to pick specific candidate when candidates are shown
    if (activeWord && candidates.length > 0 && /^[1-5]$/.test(e.key)) {
      const idx = parseInt(e.key, 10) - 1
      if (idx < candidates.length) {
        e.preventDefault()
        commitCandidate(candidates[idx], ' ')
        return
      }
    }

    // 3. Smart Backspace: undo converted word back to original Roman letters
    if (e.key === 'Backspace' && lastConversionRef.current && textareaRef.current) {
      const el = textareaRef.current
      const pos = el.selectionStart
      const last = lastConversionRef.current

      // Check if cursor is right at the end of the last conversion
      if (pos === last.endIndex) {
        e.preventDefault()
        const text = el.value
        const restored = text.slice(0, last.startIndex) + last.original + text.slice(last.endIndex)
        const newPos = last.startIndex + last.original.length

        lastConversionRef.current = null
        setCanUndo(false)
        onChange(restored)

        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = newPos
            textareaRef.current.selectionEnd = newPos
            updateActiveWord()
          }
        })
        return
      }
    }
  }

  // ── Input & Change Handler ──────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    lastKeyTimeRef.current = Date.now()
    keyPressCountRef.current += 1
    const newValue = e.target.value

    // Check for mobile transliteration commit (e.g. spacebar press)
    if (isTransliterationOn && activeWord && candidates.length > 0) {
      const pos = e.target.selectionStart
      const lastChar = newValue.slice(pos - 1, pos)

      if (/[\s,.?!\n]/.test(lastChar)) {
        const textBeforeSpace = newValue.slice(0, pos - 1)
        if (textBeforeSpace.endsWith(activeWord)) {
          const chosen = candidates[selectedIndex] || candidates[0] || activeWord
          const startIndex = pos - 1 - activeWord.length
          const newText = newValue.slice(0, startIndex) + chosen + lastChar + newValue.slice(pos)
          const newCursorPos = startIndex + chosen.length + 1

          lastConversionRef.current = {
            original: activeWord,
            converted: chosen,
            startIndex,
            endIndex: newCursorPos,
          }
          setCanUndo(true)
          onChange(newText)
          setActiveWord('')
          setCandidates([])

          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = newCursorPos
              textareaRef.current.selectionEnd = newCursorPos
              textareaRef.current.focus()
            }
          })
          return
        }
      }
    }

    onChange(newValue)
    lastConversionRef.current = null
    setCanUndo(false)

    // Instantly update active word on mobile where keyUp might be delayed/skipped
    requestAnimationFrame(() => {
      updateActiveWord()
    })
  }

  const handleKeyUp = () => {
    updateActiveWord()
  }

  const handleSelect = () => {
    updateActiveWord()
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
    <div className="space-y-2">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-[oklch(0.42_0.16_250)]" />
          <Label htmlFor="transliterate-toggle" className="text-xs text-slate-700 font-semibold cursor-pointer">
            मराठी टायपिंग सहाय्यक (Google Transliteration)
          </Label>
          <Switch
            id="transliterate-toggle"
            checked={isTransliterationOn}
            onCheckedChange={setIsTransliterationOn}
            className="scale-75 origin-left"
          />
        </div>

        {isTransliterationOn ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              सक्रिय: &quot;kuthe&quot; → &quot;कुठे&quot;
            </span>
            <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono">
              (Ctrl+G चालू/बंद)
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500 italic">
            स्थानिक मराठी कीबोर्ड चालू आहे (English typing)
          </span>
        )}
      </div>

      {/* ── Mobile-First Touch Candidate Strip ── */}
      {isTransliterationOn && candidates.length > 0 && (
        <div className="relative z-10 animate-fade-in">
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md text-white rounded-xl shadow-lg overflow-x-auto whitespace-nowrap scrollbar-none border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider px-2 shrink-0">
              पर्याय:
            </span>

            {candidates.map((cand, idx) => {
              const isSelected = idx === selectedIndex
              return (
                <button
                  key={`${cand}-${idx}`}
                  type="button"
                  // onTouchStart preventDefault keeps mobile virtual keyboard open and focused!
                  onTouchStart={e => e.preventDefault()}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => commitCandidate(cand, ' ')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-marathi font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-[oklch(0.42_0.16_250)] text-white shadow-xs font-semibold'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <span className="text-[10px] opacity-60 font-mono">{idx + 1}.</span>
                  <span>{cand}</span>
                  {isSelected && <Check className="w-3 h-3 text-white/80 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Textarea Input */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onSelect={handleSelect}
          onPaste={handlePaste}
          onDrop={handleDrop}
          disabled={disabled}
          placeholder={placeholder}
          rows={6}
          className="w-full min-h-[170px] p-4 text-base md:text-lg font-marathi leading-relaxed text-slate-900 bg-white border border-[oklch(0.88_0.02_250)] rounded-xl shadow-inner focus:outline-hidden focus:ring-2 focus:ring-[oklch(0.42_0.16_250)] focus:border-transparent transition-all placeholder:font-sans placeholder:text-slate-400 placeholder:text-sm resize-y"
          style={{ fontFeatureSettings: '"kern" 1, "liga" 1' }}
        />

        {/* Anti-paste Warning Popup */}
        {pasteWarning && (
          <div className="absolute bottom-3 left-3 right-3 bg-amber-500/95 text-white text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-lg animate-fade-in-up backdrop-blur-xs z-20">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              गुणवत्तेच्या खात्रीसाठी कृपया मजकूर पेस्ट न करता स्वतः मराठीत टाईप करा.
            </span>
          </div>
        )}
      </div>

      {/* Mobile Hint Subtext */}
      <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
        <span>
          💡 इंग्रजी अक्षरांमध्ये टाईप करा (उदा. <em>namaskar</em>) व <strong>Space</strong> दाबा.
        </span>
        {canUndo && (
          <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
            <Undo2 className="w-3 h-3" />
            Backspace दाबल्यास इंग्रजी शब्द परत येईल
          </span>
        )}
      </div>
    </div>
  )
}
