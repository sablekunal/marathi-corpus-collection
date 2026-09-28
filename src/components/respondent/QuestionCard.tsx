'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TransliterateTextarea } from './TransliterateTextarea'
import { checkQuality } from '@/lib/quality/checks'
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react'

interface QuestionCardProps {
  question: {
    questionId: string
    category: string
    question: string
    description?: string
    required: boolean
    minWords: number
    maxWords: number
    estimatedTime?: number
    order: number
  }
  questionIndex: number
  totalQuestions: number
  value: string
  onChange: (val: string) => void
  onPasteAttempt: () => void
  onMetricsUpdate: (metrics: {
    totalDurationMs: number
    activeDurationMs: number
    idleDurationMs: number
    wordsTyped: number
    charsTyped: number
    typingSpeedWpm: number
  }) => void
  onNext: () => void
  onPrev: () => void
  onSubmitAll?: () => void
  isSubmitting?: boolean
  transliterationEnabled?: boolean
  antiPasteEnabled?: boolean
}

export function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  value,
  onChange,
  onPasteAttempt,
  onMetricsUpdate,
  onNext,
  onPrev,
  onSubmitAll,
  isSubmitting = false,
  transliterationEnabled = true,
  antiPasteEnabled = true,
}: QuestionCardProps) {
  const [touched, setTouched] = useState(false)

  const currentWords = value.trim().split(/\s+/).filter(w => w.length > 0).length
  const isMinMet = currentWords >= question.minWords
  const isLast = questionIndex === totalQuestions - 1

  // Real-time quality evaluation
  const qualityReport = checkQuality(value, question.minWords)

  // Encouraging microcopy
  let microcopy = ''
  if (isLast && isMinMet) {
    microcopy = '🎉 उत्तम! सबमिट करू शकता.'
  } else if (isMinMet) {
    microcopy = '✓ छान! पुढे जाण्यासाठी सज्ज.'
  } else if (currentWords > 0) {
    microcopy = `अजून ${question.minWords - currentWords} शब्द लिहा.`
  }

  const handleNextClick = () => {
    setTouched(true)
    if (isLast) {
      if (onSubmitAll) onSubmitAll()
    } else {
      onNext()
    }
  }

  const progressPct = Math.round(((questionIndex + 1) / totalQuestions) * 100)

  return (
    <motion.div
      key={question.questionId}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col justify-between h-full py-3"
    >
      {/* ── Slim Progress Strip ── */}
      <div className="mb-3 flex-shrink-0">
        <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5">
          <span>प्रश्न {questionIndex + 1} / {totalQuestions}</span>
          {question.estimatedTime && (
            <span>~{question.estimatedTime} सेकंद</span>
          )}
        </div>
        <div className="w-full h-[3px] bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Question & Micro-hint ── */}
      <div className="mb-3 flex-shrink-0">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug mb-1.5">
          {question.question}
        </h2>
        {question.description && (
          <p className="text-xs text-slate-500 leading-relaxed mb-1">
            {question.description}
          </p>
        )}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
          <p className="text-xs text-amber-950 font-semibold leading-relaxed font-marathi">
            💡 तुमच्याकडे बोलल्या जाणाऱ्या बोलीभाषेत (उदा. कोकणी, वऱ्हाडी,...) उत्तर लिहा; शुद्ध मराठीचा वापर टाळा.
          </p>
          <p className="text-[11px] text-amber-800 mt-0.5">
            (मराठी देवनागरी किंवा &quot;mala aamba avadto&quot; सारख्या रोमन लिपीतही चालेल. कोणतेही कडक व्याकरण नियम नाहीत.)
          </p>
        </div>
      </div>

      {/* ── Transliteration Textarea (compact) ── */}
      <div className="flex-1 min-h-0 flex flex-col gap-2">
        <TransliterateTextarea
          value={value}
          onChange={(val) => {
            onChange(val)
            if (!touched) setTouched(true)
          }}
          onPasteAttempt={onPasteAttempt}
          onMetricsUpdate={onMetricsUpdate}
          transliterationDefault={transliterationEnabled}
          antiPasteEnabled={antiPasteEnabled}
          minWords={question.minWords}
        />
      </div>

      {/* ── Inline word counter + quality warnings ── */}
      <div className="mt-2 flex-shrink-0 space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <span className={`text-xs font-medium ${isMinMet ? 'text-emerald-600' : 'text-slate-400'}`}>
            शब्द: {currentWords}/{question.minWords} {isMinMet ? '✓' : `(किमान ${question.minWords} आवश्यक)`}
          </span>
          {microcopy && (
            <span className="text-xs text-slate-400">{microcopy}</span>
          )}
        </div>

        {touched && qualityReport.warnings.length > 0 && currentWords > 5 && (
          <div className="flex flex-wrap gap-1">
            {qualityReport.warnings.map((w, idx) => (
              <div key={idx} className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom Controls ── */}
      <div className="mt-3 flex-shrink-0">
        <button
          type="button"
          onClick={handleNextClick}
          disabled={!isMinMet || isSubmitting}
          className="w-full bg-orange-600 hover:bg-orange-700 active:bg-orange-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex justify-center items-center gap-2 shadow-sm"
        >
          {isLast ? (
            isSubmitting ? 'सबमिट होत आहे...' : <><span>संपूर्ण प्रतिसाद सबमिट करा</span><CheckCircle className="w-4 h-4" /></>
          ) : (
            <><span>पुढील प्रश्न</span><ArrowRight className="w-4 h-4" /></>
          )}
        </button>

        <button
          type="button"
          onClick={onPrev}
          disabled={questionIndex === 0 || isSubmitting}
          className="w-full mt-2 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-colors flex justify-center items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" /> मागील प्रश्न
        </button>
      </div>
    </motion.div>
  )
}
