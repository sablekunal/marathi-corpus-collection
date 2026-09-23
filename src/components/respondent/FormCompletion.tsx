'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, HeartHandshake, Sparkles, Home, Target } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShareButtons } from '@/components/ShareButtons'

interface FormCompletionProps {
  totalQuestions: number
  totalWords: number
  sessionId: string
}

export function FormCompletion({ totalQuestions, totalWords, sessionId }: FormCompletionProps) {
  const formUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-white rounded-2xl border border-[oklch(0.88_0.02_250)] p-8 sm:p-12 text-center shadow-xl max-w-xl mx-auto space-y-8"
    >
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="absolute -top-1 -right-1 bg-amber-400 p-1.5 rounded-full text-white shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-marathi text-3xl font-bold text-slate-800">
          खूप खूप धन्यवाद!
        </h2>
        <p className="text-base text-slate-600 font-medium">
          आपले मौल्यवान उत्तर यशस्वीरीत्या नोंदवले गेले आहे.
        </p>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          आपण दिलेले योगदान मराठी भाषेसाठी तयार होणाऱ्या अत्याधुनिक कृत्रिम बुद्धिमत्ता (AI / LLM) मॉडेल्सच्या संशोधनासाठी अतिशय मोलाचे ठरेल.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
        <div>
          <div className="text-2xl font-bold text-[oklch(0.42_0.16_250)]">
            {totalQuestions}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">
            पूर्ण केलेले प्रश्न
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-600">
            {totalWords}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">
            एकूण शब्द योगदान
          </div>
        </div>
      </div>

      {/* ── Share CTA (Viral Loop) ───────────────────────────────────── */}
      <div className="bg-blue-50/80 border border-blue-200/60 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-900">
          <Target className="w-4 h-4 text-blue-600" />
          <span>आम्हाला ५०० प्रतिसाद मिळवायला मदत करा!</span>
        </div>
        <p className="text-xs text-blue-800 leading-relaxed">
          तुमचे मित्र, कुटुंबीय आणि सहकाऱ्यांना या प्रकल्पात सहभागी होण्यासाठी शेअर करा.
          <span className="block text-blue-700 mt-0.5">
            Help us reach 500 responses — share with friends and family!
          </span>
        </p>
        <ShareButtons formUrl={formUrl} compact />
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <HeartHandshake className="w-4 h-4 text-rose-500" />
          <span>मराठी भाषेच्या डिजिटल संवर्धनात सहभागी झाल्याबद्दल आभार!</span>
        </div>

        <div className="text-[10px] text-slate-400 font-mono">
          Session ID: {sessionId}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button 
            onClick={() => {
              const slug = window.location.pathname.split('/').pop()
              if (slug) {
                localStorage.removeItem(`session_${slug}`)
                window.location.reload()
              }
            }}
            className="gap-2 text-xs bg-[oklch(0.42_0.16_250)] text-white hover:bg-blue-700 w-full sm:w-auto"
          >
            कुटुंबातील दुसऱ्या व्यक्तीसाठी फॉर्म भरा
          </Button>

          <Link href="/">
            <Button variant="outline" className="gap-2 text-xs">
              <Home className="w-3.5 h-3.5" />
              मुख्य पान
            </Button>
          </Link>
          <Link href="/stats">
            <Button variant="outline" className="gap-2 text-xs">
              आकडेवारी
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
