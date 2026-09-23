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

      {/* ── Share CTA (Viral Loop) - Moved UP and made PROMINENT ───────────────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-4 my-8 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-100 rounded-full opacity-50 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-indigo-100 rounded-full opacity-50 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-3">
          <div className="inline-flex items-center justify-center gap-2 text-lg font-bold text-blue-900 bg-blue-100/50 px-4 py-1.5 rounded-full mb-1">
            <Target className="w-5 h-5 text-blue-600" />
            <span>आम्हाला ५०० प्रतिसाद मिळवायला मदत करा!</span>
          </div>
          
          <p className="text-sm md:text-base font-semibold text-blue-800 leading-relaxed max-w-md">
            तुमचे मित्र, कुटुंबीय आणि सहकाऱ्यांना या प्रकल्पात सहभागी होण्यासाठी आत्ताच शेअर करा.
            <span className="block text-xs md:text-sm text-blue-600 mt-1 font-sans font-medium">
              Help us reach 500 responses — share with friends and family!
            </span>
          </p>
          
          <div className="pt-3 w-full max-w-sm mx-auto">
            <ShareButtons formUrl={formUrl} />
          </div>
        </div>
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

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <HeartHandshake className="w-4 h-4 text-rose-500" />
          <span>मराठी भाषेच्या डिजिटल संवर्धनात सहभागी झाल्याबद्दल आभार!</span>
        </div>

        <div className="text-[10px] text-slate-400 font-mono">
          Session ID: {sessionId}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 w-full">
          <Button 
            onClick={() => window.location.reload()}
            className="gap-2 text-sm md:text-base font-bold bg-[oklch(0.42_0.16_250)] text-white hover:bg-blue-700 w-full sm:w-auto px-6 h-12 md:h-14"
          >
            नवीन प्रतिसाद सुरू करा
          </Button>

          <Link href="/">
            <Button variant="outline" className="gap-2 text-sm md:text-base font-bold h-12 md:h-14 px-6 w-full sm:w-auto">
              <Home className="w-4 h-4 md:w-5 md:h-5" />
              मुख्य पान
            </Button>
          </Link>
          <Link href="/stats">
            <Button variant="outline" className="gap-2 text-sm md:text-base font-bold h-12 md:h-14 px-6 w-full sm:w-auto">
              आकडेवारी
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
