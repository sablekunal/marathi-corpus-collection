import Link from 'next/link'
import { BookOpen, ArrowRight, BarChart3, Shield, Users, Globe, Sparkles } from 'lucide-react'
import { db } from '@/lib/db'
import { forms, respondentSessions, responses } from '@/lib/db/schema'
import { eq, sql, count, sum } from 'drizzle-orm'

async function getPublicStats() {
  try {
    const [{ totalSubmissions }] = await db
      .select({ totalSubmissions: count() })
      .from(respondentSessions)
      .where(sql`submitted_at IS NOT NULL`)

    const [{ totalWords }] = await db
      .select({ totalWords: sum(responses.wordCount) })
      .from(responses)

    return {
      totalSubmissions: totalSubmissions || 0,
      totalWords: Number(totalWords) || 0,
    }
  } catch {
    return { totalSubmissions: 0, totalWords: 0 }
  }
}

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
  const stats = await getPublicStats()
  const formSlug = await getPublishedFormSlug()

  return (
    <main className="min-h-screen bg-gradient-to-br from-[oklch(0.97_0.01_250)] via-white to-[oklch(0.93_0.03_250)]">
      {/* ── Hero Section ───────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-10 text-center animate-fade-in-up">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[oklch(0.42_0.16_250)] rounded-2xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-marathi text-4xl sm:text-5xl font-bold text-[oklch(0.20_0.04_250)] mb-3">
          मराठी भाषा संग्रह
        </h1>
        <p className="text-lg sm:text-xl text-[oklch(0.42_0.10_250)] font-medium mb-2">
          Marathi Language Corpus Collection
        </p>
        <p className="text-[oklch(0.52_0.04_250)] text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8">
          आपल्या मराठीचे योगदान करा — We are building a high-quality Marathi language 
          dataset for AI research. Your authentic Marathi text will help train better language models.
        </p>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600 mb-8 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-600">✓</span> फक्त ५ मिनिटे (5 min)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-600">✓</span> पूर्णपणे निनावी (Anonymous)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-600">✓</span> मराठी NLP साठी
          </span>
        </div>

        {/* Primary CTA */}
        <Link
          href={`/f/${formSlug}`}
          className="inline-flex items-center gap-2.5 bg-[oklch(0.42_0.16_250)] text-white px-8 py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-[oklch(0.35_0.14_250)] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <span>सहभागी व्हा — Participate Now</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* ── Live Stats Strip ───────────────────────────────────────── */}
      {stats.totalSubmissions > 0 && (
        <div className="max-w-2xl mx-auto px-4 mb-10">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-[oklch(0.88_0.02_250)] p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[oklch(0.42_0.16_250)]">
                  {stats.totalSubmissions}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  एकूण प्रतिसाद (Responses)
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.totalWords > 1000
                    ? `${Math.round(stats.totalWords / 1000)}K`
                    : stats.totalWords}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  एकूण शब्द (Words)
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-center">
              <Link href="/stats" className="text-xs text-[oklch(0.42_0.16_250)] hover:underline font-medium">
                पूर्ण आकडेवारी पहा (View Full Stats) →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Info Cards ─────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 pb-12">
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
              <Globe className="w-4.5 h-4.5 text-[oklch(0.42_0.16_250)]" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 mb-1.5">प्रकल्पाविषयी</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              मराठी भाषेच्या कृत्रिम बुद्धिमत्ता मॉडेल्ससाठी उच्च-दर्जाचा मजकूर डेटासंच तयार करण्यासाठी हा प्रकल्प आहे.
              <span className="block mt-1 text-slate-500">
                Building a high-quality text corpus for Marathi AI models and academic research.
              </span>
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
              <Shield className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 mb-1.5">गोपनीयता</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              आपले प्रतिसाद निनावी ठेवले जातात. IP पत्ता SHA-256 हॅश केला जातो आणि १८० दिवसांनंतर हटवला जातो.
              <span className="block mt-1 text-slate-500">
                Responses are anonymized. IP addresses are hashed and auto-deleted after 180 days.
              </span>
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center mb-3">
              <Users className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 mb-1.5">सहभागी कसे व्हावे</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ३-५ प्रश्नांची मराठी उत्तरे आपल्या बोलीभाषेत लिहा — व्याकरणाची चिंता नाही!
              <span className="block mt-1 text-slate-500">
                Answer 3-5 questions in your natural Marathi dialect. No grammar worries!
              </span>
            </p>
          </div>
        </div>

        {/* ── Dialect Reassurance ───────────────────────────────────── */}
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-5 mb-10">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900 mb-1 font-marathi">
                तुमच्या बोलीभाषेत लिहा — प्रमाण मराठी असायला हवं असं नाही!
              </p>
              <p className="text-xs text-amber-800 leading-relaxed">
                वऱ्हाडी, अहिराणी, मालवणी, कोकणी, मराठवाडी — कोणत्याही बोलीभाषेतील मराठी मौल्यवान आहे.
                <span className="block text-amber-700 mt-0.5">
                  Write in any Marathi dialect: Varhadi, Ahirani, Malvani, Konkani, Marathwadi — all are valuable!
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Secondary Actions ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Link
            href={`/f/${formSlug}`}
            className="inline-flex items-center gap-2 bg-[oklch(0.42_0.16_250)] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[oklch(0.35_0.14_250)] transition-all shadow-md"
          >
            सर्वेक्षण सुरू करा (Start Survey)
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/stats"
            className="inline-flex items-center gap-2 bg-white text-slate-700 px-6 py-3 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            आकडेवारी पहा (View Stats)
          </Link>
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className="text-center pt-6 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-[oklch(0.42_0.16_250)] underline transition-colors">
              गोपनीयता धोरण (Privacy Policy)
            </Link>
            <span>|</span>
            <Link href="/admin" className="hover:text-[oklch(0.42_0.16_250)] transition-colors">
              Admin
            </Link>
          </div>
          <p className="text-[11px] text-slate-400">
            CC-BY-4.0 License • Marathi Corpus Research Team
          </p>
        </div>
      </div>
    </main>
  )
}
