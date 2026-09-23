'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Progress } from '@/components/ui/progress'
import { QuestionCard } from '@/components/respondent/QuestionCard'
import { MetadataForm } from '@/components/respondent/MetadataForm'
import { Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { useDraftAutoSave } from '@/hooks/useDraftAutoSave'
import Image from 'next/image'

// Lazy-load FormCompletion to save initial JS bundle size
const FormCompletion = dynamic(() => import('@/components/respondent/FormCompletion').then(mod => mod.FormCompletion), {
  loading: () => <div className="text-center p-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></div>
})

interface QuestionItem {
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

interface FormConfig {
  id: string
  title: string
  description: string | null
  slug: string
  transliterationEnabled: boolean | null
  antiPasteEnabled: boolean | null
  commentsEnabled: boolean | null
  metadataConfig: string | null
}

interface ClientFormShellProps {
  slug: string
  initialForm: FormConfig
}

export function ClientFormShell({ slug, initialForm }: ClientFormShellProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormConfig>(initialForm)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  
  // Step flow: 'metadata' -> 'questions' -> 'completed'
  const [step, setStep] = useState<'metadata' | 'questions' | 'completed'>('metadata')

  // ── Draft Auto-Save ─────────────────────────────────────────────────
  const {
    answers,
    setAnswers,
    currentIndex,
    setCurrentIndex,
    metadata,
    setMetadata,
    clearDraft,
    hasDraft,
  } = useDraftAutoSave(slug, sessionId)

  const [pasteCounts, setPasteCounts] = useState<Record<string, number>>({})
  const [typingMetricsMap, setTypingMetricsMap] = useState<
    Record<
      string,
      {
        totalDurationMs: number
        activeDurationMs: number
        idleDurationMs: number
        wordsTyped: number
        charsTyped: number
        typingSpeedWpm: number
      }
    >
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch session & assigned questions
  useEffect(() => {
    async function initSession() {
      try {
        setLoading(true)
        
        let storedSession: string | null = null
        try {
          storedSession = localStorage.getItem(`session_${slug}`)
        } catch (e) {
          console.warn('localStorage is blocked by privacy settings')
        }

        const url = storedSession
          ? `/api/forms/${slug}/session?sessionId=${storedSession}`
          : `/api/forms/${slug}/session`

        const res = await fetch(url)
        let data: any = null
        try {
          data = await res.json()
        } catch {
          // Response body was empty or not JSON
        }

        if (!res.ok) {
          setError(data?.error || `सर्व्हर त्रुटी आली (${res.status}). कृपया पुन्हा प्रयत्न करा.`)
          setLoading(false)
          return
        }

        if (!data || !data.session) {
          setError('फॉर्म माहिती लोड करता आली नाही.')
          setLoading(false)
          return
        }

        if (data.alreadySubmitted) {
          try {
            localStorage.removeItem(`session_${slug}`)
          } catch(e) {}
          window.location.reload()
          return
        }

        setSessionId(data.session.id)
        
        try {
          localStorage.setItem(`session_${slug}`, data.session.id)
        } catch(e) {}
        
        setQuestions(data.questions || [])

        // If metadata is empty or not required, jump to questions
        const metaConf = JSON.parse(initialForm.metadataConfig || '{}')
        if (Object.keys(metaConf).length === 0 && metaConf.requireProfile === false) {
          setStep('questions')
        }
      } catch (err) {
        console.error(err)
        setError('सर्व्हरशी संपर्क होऊ शकला नाही. कृपया इंटरनेट तपासा.')
      } finally {
        setLoading(false)
      }
    }

    initSession()
  }, [slug, initialForm])

  // If draft has saved answers and we have questions loaded, resume from questions step
  useEffect(() => {
    if (hasDraft && questions.length > 0 && Object.keys(answers).length > 0 && step === 'metadata') {
      setStep('questions')
    }
  }, [hasDraft, questions, answers, step])

  const handleMetadataSubmit = (meta: Record<string, string>) => {
    setMetadata(meta)
    setStep('questions')
  }

  const handleAnswerChange = (qId: string, text: string) => {
    setAnswers(prev => ({ ...prev, [qId]: text }))
  }

  const handlePasteAttempt = (qId: string) => {
    setPasteCounts(prev => ({ ...prev, [qId]: (prev[qId] || 0) + 1 }))
  }

  const handleMetricsUpdate = useCallback((
    qId: string,
    metrics: {
      totalDurationMs: number
      activeDurationMs: number
      idleDurationMs: number
      wordsTyped: number
      charsTyped: number
      typingSpeedWpm: number
    }
  ) => {
    setTypingMetricsMap(prev => ({ ...prev, [qId]: metrics }))
  }, [])

  const handleSubmitAll = async () => {
    if (!sessionId || !form) return
    setIsSubmitting(true)

    try {
      const responsePayload = questions.map(q => ({
        questionId: q.questionId,
        responseText: answers[q.questionId] || '',
        minWords: q.minWords,
        pasteAttempts: pasteCounts[q.questionId] || 0,
        typingMetrics: typingMetricsMap[q.questionId] || {
          totalDurationMs: 0,
          activeDurationMs: 0,
          idleDurationMs: 0,
          wordsTyped: (answers[q.questionId] || '').split(/\s+/).length,
          charsTyped: (answers[q.questionId] || '').length,
          typingSpeedWpm: 0,
        },
      }))

      const res = await fetch('/api/responses/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          metadata,
          responses: responsePayload,
        }),
      })

      let result: any = null
      try {
        result = await res.json()
      } catch {}

      if (!res.ok) {
        alert(result?.error || `सबमिशन अयशस्वी झाले (सर्व्हर त्रुटी ${res.status}).`)
        setIsSubmitting(false)
        return
      }

      setStep('completed')
      clearDraft()
      try {
        localStorage.removeItem(`session_${slug}`)
      } catch (e) {}
    } catch (err) {
      console.error(err)
      alert('इंटरनेट त्रुटी आली. कृपया पुन्हा प्रयत्न करा.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Early returns for loading/error states
  // We keep the branding shell visible even during loading for SSR effect
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-[oklch(0.97_0.01_250)] to-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Branding (Always visible instantly due to SSR props) */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-[oklch(0.88_0.02_250)] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden border border-slate-100 p-1 relative">
              <Image src="/logo.png" alt="Logo" fill className="object-contain p-1" />
            </div>
            <div>
              <h1 className="font-marathi font-bold text-sm text-slate-900 leading-tight">
                {form.title}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                मराठी भाषा संशोधन प्रकल्प
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full font-medium border border-blue-100">
            <Sparkles className="w-3 h-3 text-blue-500" />
            LLM Corpus
          </span>
        </div>

        {error ? (
          <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center shadow-lg space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-800">माहिती</h2>
            <p className="text-sm text-slate-600">{error}</p>
          </div>
        ) : loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-[oklch(0.42_0.16_250)] mb-3" />
            <p className="text-slate-600 font-medium text-sm">फॉर्म लोड होत आहे...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <p className="text-slate-600">या फॉर्ममध्ये सध्या कोणतेही प्रश्न उपलब्ध नाहीत.</p>
          </div>
        ) : (
          <>
            {/* Global Progress Bar when in Question step */}
            {step === 'questions' && (
              <div className="space-y-1.5 px-1">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>प्रगती (Overall Progress)</span>
                  <span>{currentIndex + 1} of {questions.length}</span>
                </div>
                <Progress value={Math.round(((currentIndex + 1) / questions.length) * 100)} className="h-2 bg-slate-200" />
              </div>
            )}

            {/* Flow Switcher */}
            {step === 'metadata' && (
              <div className="bg-white rounded-2xl border border-[oklch(0.88_0.02_250)] p-6 sm:p-8 shadow-sm space-y-6">
                {form.description && (
                  <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {form.description}
                  </div>
                )}
                <MetadataForm
                  metadataConfig={JSON.parse(form.metadataConfig || '{}')}
                  onSubmit={handleMetadataSubmit}
                />
              </div>
            )}

            {step === 'questions' && questions[currentIndex] && (
              <QuestionCard
                question={questions[currentIndex]}
                questionIndex={currentIndex}
                totalQuestions={questions.length}
                value={answers[questions[currentIndex].questionId] || ''}
                onChange={(val) => handleAnswerChange(questions[currentIndex].questionId, val)}
                onPasteAttempt={() => handlePasteAttempt(questions[currentIndex].questionId)}
                onMetricsUpdate={(m) => handleMetricsUpdate(questions[currentIndex].questionId, m)}
                onNext={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
                onPrev={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                onSubmitAll={handleSubmitAll}
                isSubmitting={isSubmitting}
                transliterationEnabled={form.transliterationEnabled ?? false}
                antiPasteEnabled={form.antiPasteEnabled ?? false}
              />
            )}

            {step === 'completed' && (
              <FormCompletion
                totalQuestions={questions.length}
                totalWords={Object.values(answers).reduce(
                  (acc, text) => acc + (text.trim().split(/\s+/).filter(Boolean).length || 0),
                  0
                )}
                sessionId={sessionId || ''}
              />
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-center pt-2">
          <Link
            href="/privacy"
            target="_blank"
            className="text-[11px] text-slate-400 hover:text-slate-600 underline transition-colors"
          >
            गोपनीयता धोरण व डेटा हक्क (Privacy Policy & Data Ethics)
          </Link>
        </div>
      </div>
    </div>
  )
}
