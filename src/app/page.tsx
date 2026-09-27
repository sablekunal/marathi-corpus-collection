export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { db } from '@/lib/db'
import { respondentSessions, responses } from '@/lib/db/schema'
import { count, sql } from 'drizzle-orm'

async function getLiveMetrics() {
  try {
    const [sCount] = await db
      .select({ value: count() })
      .from(respondentSessions)
      .where(sql`submitted_at IS NOT NULL`)

    const [rCount] = await db.select({ value: count() }).from(responses)

    return {
      sessions: sCount?.value ?? 0,
      responses: rCount?.value ?? 0,
    }
  } catch {
    return { sessions: 0, responses: 0 }
  }
}

export default async function HomePage() {
  const metrics = await getLiveMetrics()

  return (
    <main className="w-full flex-1 flex flex-col max-w-md mx-auto px-4 py-8">
      {/* Hero Section */}
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 leading-snug font-marathi">
        तुमच्या मराठीला <span className="text-orange-600">AI च्या भविष्यात</span> स्थान द्या.
      </h1>

      <p className="text-sm text-center text-slate-600 mt-2 font-marathi">
        मराठी भाषेच्या AI संशोधनासाठी उच्च-दर्जाचा मुक्त डेटासंच.
        <br />
        <span className="text-xs text-slate-400 font-sans">(Help build open AI for Marathi.)</span>
      </p>

      {/* CTA Button */}
      <Link
        href="/f/marathi-pilot-2026"
        className="w-full mt-5 block text-center bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-xs text-base transition-colors font-marathi"
      >
        योगदान द्या (५ मिनिटे) →
      </Link>

      {/* Trust Strip */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[12px] text-slate-500 font-medium">
        <span className="flex items-center gap-1">⚡ ३ मिनिटे</span>
        <span className="opacity-40">•</span>
        <span className="flex items-center gap-1">🔒 १००% निनावी</span>
        <span className="opacity-40">•</span>
        <span className="flex items-center gap-1">🌐 CC BY 4.0</span>
      </div>

      {/* Live Counter & Info */}
      <div className="w-full mt-10 space-y-4">
        {/* Live Counter Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center shadow-xs">
          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-700">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              संकलन सुरू (Live)
            </span>
            <span className="text-slate-300">•</span>
            <span>{metrics.responses} उत्तरे</span>
            <span className="text-slate-300">•</span>
            <span>{metrics.sessions} सहभागी</span>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden text-sm">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-1 font-marathi">
              सहभागी कसे व्हावे &amp; प्रकल्प माहिती
            </h3>
            <p className="text-slate-700 leading-relaxed font-marathi">
              कोणत्याही व्याकरणाची चिंता न करता ३-५ प्रश्नांची उत्तरे आपल्या नैसर्गिक बोलीभाषेत
              लिहा. गोळा केलेला डेटा CC BY 4.0 अंतर्गत मराठी AI संशोधनासाठी खुला केला जाईल.
            </p>
          </div>
          <div className="p-4 bg-slate-50">
            <h3 className="font-semibold text-slate-900 mb-1 font-marathi">डेटा गोपनीयता</h3>
            <p className="text-slate-700 leading-relaxed mb-3 font-marathi">
              नाव किंवा ईमेल आवश्यक नाही. IP पत्ता SHA-256 द्वारे हॅश केला जातो व १८०
              दिवसांनंतर आपोआप नष्ट होतो.
            </p>
            <Link
              href="/privacy"
              className="text-orange-600 font-medium hover:underline inline-flex items-center gap-1 text-xs sm:text-sm font-marathi"
            >
              गोपनीयता धोरण (Privacy Policy) वाचा →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
