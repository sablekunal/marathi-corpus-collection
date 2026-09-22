import Link from 'next/link'
import { BookOpen, ArrowRight, BarChart3, Shield, Users, Globe, Sparkles } from 'lucide-react'
import { db } from '@/lib/db'
import { forms } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import HeroSection from '@/components/HeroSection'
import ImpactStats from '@/components/ImpactStats'
import DialectCards from '@/components/DialectCards'
import PrivacyCard from '@/components/PrivacyCard'

async function getPublishedFormSlug(): Promise<string> {
  try {
    const [publishedForm] = await db
      .select({ slug: forms.slug })
      .from(forms)
      .where(eq(forms.isPublished, true))
      .limit(1)
    return publishedForm?.slug || 'marathi-pilot-2026'
  } catch {
    return 'marathi-pilot-2026'
  }
}

export default async function HomePage() {
  const formSlug = await getPublishedFormSlug()

  return (
    <main className="min-h-screen bg-gradient-to-br from-[oklch(0.97_0.01_250)] via-white to-[oklch(0.93_0.03_250)] pb-12">
      {/* ── Hero Section ───────────────────────────────────────────── */}
      <HeroSection formSlug={formSlug} />

      {/* ── Live Stats Strip ───────────────────────────────────────── */}
      <ImpactStats />

      {/* ── Dialect Cards ──────────────────────────────────────────── */}
      <DialectCards />

      {/* ── Info Cards ─────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 mt-8 md:mt-12 mb-8 md:mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8 md:mb-10">
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
              <Globe className="w-4.5 h-4.5 text-[oklch(0.42_0.16_250)]" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 mb-1.5 font-marathi">प्रकल्पाविषयी</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-marathi">
              मराठी भाषेच्या कृत्रिम बुद्धिमत्ता मॉडेल्ससाठी उच्च-दर्जाचा मजकूर डेटासंच तयार करण्यासाठी हा प्रकल्प आहे.
              <span className="block mt-1 text-slate-500 font-sans">
                Building a high-quality text corpus for Marathi AI models and academic research.
              </span>
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
              <Shield className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 mb-1.5 font-marathi">गोपनीयता</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-marathi">
              आपले प्रतिसाद निनावी ठेवले जातात. IP पत्ता SHA-256 हॅश केला जातो आणि १८० दिवसांनंतर हटवला जातो.
              <span className="block mt-1 text-slate-500 font-sans">
                Responses are anonymized. IP addresses are hashed and auto-deleted after 180 days.
              </span>
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center mb-3">
              <Users className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 mb-1.5 font-marathi">सहभागी कसे व्हावे</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-marathi">
              ३-५ प्रश्नांची मराठी उत्तरे आपल्या बोलीभाषेत लिहा — व्याकरणाची चिंता नाही!
              <span className="block mt-1 text-slate-500 font-sans">
                Answer 3-5 questions in your natural Marathi dialect. No grammar worries!
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Privacy Card ───────────────────────────────────────────── */}
      <PrivacyCard />

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center pt-6 border-t border-slate-100 space-y-2 mt-8 md:mt-12">
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500 font-marathi">
            <Link href="/privacy" className="hover:text-[oklch(0.42_0.16_250)] underline transition-colors">
              गोपनीयता धोरण (Privacy Policy)
            </Link>
            <span>|</span>
            <Link href="/admin" className="hover:text-[oklch(0.42_0.16_250)] transition-colors font-sans">
              Admin
            </Link>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            CC-BY-4.0 License • Marathi Corpus Research Team
          </p>
        </div>
      </div>
    </main>
  )
}
