'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { WordProgressRing } from './WordProgressRing'
import { TransliterateTextarea } from './TransliterateTextarea'
import { checkQuality } from '@/lib/quality/checks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  let microcopy = 'विचारपूर्वक व स्वतःच्या शब्दात उत्तर द्या.'
  if (isLast && isMinMet) {
    microcopy = '🎉 उत्तम! आता शेवटचा प्रश्न पूर्ण झाला असून सबमिट करू शकता.'
  } else if (isMinMet) {
    microcopy = '✓ छान! पुढील प्रश्नाकडे जाण्यासाठी सज्ज.'
  } else if (currentWords > 0) {
    microcopy = `अजून ${question.minWords - currentWords} शब्द पूर्ण करा.`
  }

  const handleNextClick = () => {
    setTouched(true)
    if (isLast) {
      if (onSubmitAll) onSubmitAll()
    } else {
      onNext()
    }
  }

  return (
    <motion.div
      key={question.questionId}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-[oklch(0.88_0.02_250)] p-6 sm:p-8 shadow-sm space-y-6"
    >
      {/* Category header & question counter */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold px-2.5 py-1 rounded-md">
            {question.category}
          </Badge>
          <span className="text-xs text-slate-500 font-medium">
            प्रश्न {questionIndex + 1} / {totalQuestions}
          </span>
        </div>
        {question.estimatedTime && (
          <span className="text-[11px] text-slate-400 font-medium">
            ~{Math.round(question.estimatedTime / 60)} मिनिट
          </span>
        )}
      </div>

      {/* Question prompt */}
      <div className="space-y-2">
        <h3 className="question-text text-xl sm:text-2xl text-slate-900 leading-relaxed font-bold">
          {question.question}
        </h3>
        {question.description && (
          <p className="text-sm text-slate-600 font-normal leading-normal">
            {question.description}
          </p>
        )}
      </div>

      {/* Word progress ring indicator */}
      <div className="flex justify-end">
        <WordProgressRing
          currentWords={currentWords}
          minWords={question.minWords}
          maxWords={question.maxWords}
        />
      </div>

      {/* Transliteration Textarea */}
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

      {/* Warnings / Guidance */}
      {touched && qualityReport.warnings.length > 0 && currentWords > 5 && (
        <div className="space-y-1 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-800">
          {qualityReport.warnings.map((w, idx) => (
            <div key={idx} className="flex items-center gap-1.5 font-marathi">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Encouragement microcopy */}
      <div className="text-xs text-slate-500 font-medium text-center font-marathi">
        {microcopy}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          disabled={questionIndex === 0 || isSubmitting}
          className="gap-2 text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          मागील प्रश्न
        </Button>

        <Button
          type="button"
          onClick={handleNextClick}
          disabled={!isMinMet || isSubmitting}
          className={`gap-2 text-xs sm:text-sm px-6 h-11 ${
            isLast
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
              : 'bg-[oklch(0.42_0.16_250)] hover:bg-[oklch(0.35_0.14_250)] text-white'
          }`}
        >
          {isLast ? (
            isSubmitting ? (
              'सबमिट होत आहे...'
            ) : (
              <>
                <span>संपूर्ण प्रतिसाद सबमिट करा</span>
                <CheckCircle className="w-4 h-4" />
              </>
            )
          ) : (
            <>
              <span>पुढील प्रश्न</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
