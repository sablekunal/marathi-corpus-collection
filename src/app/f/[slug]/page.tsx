'use client'

import { useState, useEffect, use, useCallback } from 'react'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { QuestionCard } from '@/components/respondent/QuestionCard'
import { MetadataForm } from '@/components/respondent/MetadataForm'
import { FormCompletion } from '@/components/respondent/FormCompletion'
import { BookOpen, Sparkles, Loader2, AlertCircle, RotateCcw } from 'lucide-react'
import { useDraftAutoSave } from '@/hooks/useDraftAutoSave'

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
  description?: string
  slug: string
  transliterationEnabled: boolean
  antiPasteEnabled: boolean
  commentsEnabled: boolean
  metadataConfig?: string
}

export default function FormRespondentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormConfig | null>(null)
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
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false)

  // Fetch session & assigned questions
  useEffect(() => {
    async function initSession() {
      try {
        setLoading(true)
        const storedSession = localStorage.getItem(`session_${slug}`)
        const url = storedSession
          ? `/api/forms/${slug}/session?sessionId=${storedSession}`
          : `/api/forms/${slug}/session`

        const res = await fetch(url)
        let data: any = null
        try {
          data = await res.json()
        } catch {
          // Response body was empty or not JSON (e.g. serverless error)
        }

        if (!res.ok) {
          setError(data?.error || `सर्व्हर त्रुटी आली (${res.status}). कृपया डेटाबेस कनेक्शन (DATABASE_URL) तपासा.`)
          setLoading(false)
          return
        }

        if (!data || !data.form || !data.session) {
          setError('फॉर्म माहिती लोड करता आली नाही.')
          setLoading(false)
          return
        }

        if (data.alreadySubmitted) {
          setError('आपण आधीच या फॉर्मचा प्रतिसाद नोंदवला आहे. धन्यवाद!')
          setIsAlreadySubmitted(true)
          setLoading(false)
          return
        }

        setForm(data.form)
        setSessionId(data.session.id)
        localStorage.setItem(`session_${slug}`, data.session.id)
        setQuestions(data.questions || [])

        // If metadata is empty or not required, jump to questions
        const metaConf = JSON.parse(data.form.metadataConfig || '{}')
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
  }, [slug])

  // If draft has saved answers and we have questions loaded, resume from questions step
  useEffect(() => {
    if (hasDraft && questions.length > 0 && Object.keys(answers).length > 0 && step === 'metadata') {
      // Draft exists with answers — skip metadata, resume questions
      setStep('questions')
    }
  }, [hasDraft, questions, answers, step])

  // Handle Metadata submit
  const handleMetadataSubmit = (meta: Record<string, string>) => {
    setMetadata(meta)
    setStep('questions')
  }

  // Answer change handler
  const handleAnswerChange = (qId: string, text: string) => {
    setAnswers(prev => ({ ...prev, [qId]: text }))
  }

  // Paste attempt handler
  const handlePasteAttempt = (qId: string) => {
    setPasteCounts(prev => ({ ...prev, [qId]: (prev[qId] || 0) + 1 }))
  }

  // Typing metric handler
  const handleMetricsUpdate = (
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
  }

  // Submit all responses
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
      } catch {
        // Response body not valid JSON
      }

      if (!res.ok) {
        alert(result?.error || `सबमिशन अयशस्वी झाले (सर्व्हर त्रुटी ${res.status}).`)
        setIsSubmitting(false)
        return
      }

      setStep('completed')
      clearDraft() // Clear saved draft after successful submission
    } catch (err) {
      console.error(err)
      alert('इंटरनेट त्रुटी आली. कृपया पुन्हा प्रयत्न करा.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-marathi">
        <Loader2 className="w-8 h-8 animate-spin text-[oklch(0.42_0.16_250)] mb-3" />
        <p className="text-slate-600 font-medium text-sm">फॉर्म लोड होत आहे...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-marathi">
        <div className="bg-white border border-rose-200 rounded-2xl p-8 max-w-md w-full text-center shadow-lg space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">माहिती</h2>
          <p className="text-sm text-slate-600">{error}</p>
          {isAlreadySubmitted && (
            <button
              onClick={() => {
                localStorage.removeItem(`session_${slug}`)
                window.location.reload()
              }}
              className="mt-6 px-6 py-2.5 bg-[oklch(0.42_0.16_250)] text-white font-semibold rounded-lg hover:opacity-90 transition-all w-full text-sm"
            >
              कुटुंबातील दुसऱ्या व्यक्तीसाठी फॉर्म भरा
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!form || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-marathi">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <p className="text-slate-600">या फॉर्ममध्ये सध्या कोणतेही प्रश्न उपलब्ध नाहीत.</p>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentIndex]
  const progressPercent = step === 'questions' ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0
  const totalWordsContributed = Object.values(answers).reduce(
    (acc, text) => acc + (text.trim().split(/\s+/).filter(Boolean).length || 0),
    0
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-[oklch(0.97_0.01_250)] to-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Branding */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-[oklch(0.88_0.02_250)] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[oklch(0.42_0.16_250)] rounded-xl flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4 text-white" />
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

        {/* Global Progress Bar when in Question step */}
        {step === 'questions' && (
          <div className="space-y-1.5 px-1">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>प्रगती (Overall Progress)</span>
              <span>{currentIndex + 1} of {questions.length}</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-slate-200" />
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

        {step === 'questions' && currentQ && (
          <QuestionCard
            question={currentQ}
            questionIndex={currentIndex}
            totalQuestions={questions.length}
            value={answers[currentQ.questionId] || ''}
            onChange={(val) => handleAnswerChange(currentQ.questionId, val)}
            onPasteAttempt={() => handlePasteAttempt(currentQ.questionId)}
            onMetricsUpdate={(m) => handleMetricsUpdate(currentQ.questionId, m)}
            onNext={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
            onPrev={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
            onSubmitAll={handleSubmitAll}
            isSubmitting={isSubmitting}
            transliterationEnabled={form.transliterationEnabled}
            antiPasteEnabled={form.antiPasteEnabled}
          />
        )}

        {step === 'completed' && (
          <FormCompletion
            totalQuestions={questions.length}
            totalWords={totalWordsContributed}
            sessionId={sessionId || ''}
          />
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
