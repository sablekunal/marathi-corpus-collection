import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'संपर्क (Contact) | मराठी भाषा संग्रह',
  description: 'मराठी भाषा संग्रह प्रकल्पाशी संपर्क साधा.',
}

export default function ContactPage() {
  return (
    <main className="w-full flex-1 flex flex-col max-w-2xl mx-auto px-4 py-10">

      <div className="mb-8">
        <h1 className="font-marathi text-[24px] sm:text-[28px] font-bold text-slate-900 mb-2 leading-tight">
          संपर्क करा
          <span className="block text-[16px] sm:text-[18px] font-medium text-slate-500 mt-1">
            (Get in Touch — Marathi Bhasha Sangrah)
          </span>
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          प्रश्न, सूचना, किंवा सहकार्यासाठी खाली दिलेल्या ईमेलवर संपर्क करा.
        </p>
      </div>

      <div className="space-y-4">

        {/* Card 1 */}
        <a
          href="mailto:parshv.runwal24@vit.edu"
          className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-orange-300 hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0 group-hover:bg-orange-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium mb-0.5">संशोधक / Researcher</p>
            <p className="text-[15px] font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
              parshv.runwal24@vit.edu
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Parshv Runwal · VIT Pune</p>
          </div>
        </a>

        {/* Card 2 */}
        <a
          href="mailto:kunal.sable24@vit.edu"
          className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-orange-300 hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0 group-hover:bg-orange-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium mb-0.5">संशोधक / Researcher</p>
            <p className="text-[15px] font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
              kunal.sable24@vit.edu
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Kunal Sable · VIT Pune</p>
          </div>
        </a>

      </div>

      {/* Info block */}
      <div className="mt-8 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600 leading-relaxed">
        <p className="font-semibold text-slate-800 mb-2">📌 प्रकल्पाबद्दल</p>
        <p>
          हा प्रकल्प VIT Pune येथील विद्यार्थ्यांनी मराठी भाषेच्या NLP संशोधनासाठी विकसित केला आहे.
          डेटा CC BY 4.0 अंतर्गत मुक्तपणे उपलब्ध केला जाईल.
        </p>
        <p className="mt-2 text-slate-500 text-xs">
          (This project is developed by VIT Pune students for Marathi NLP research. Data will be released under CC BY 4.0.)
        </p>
      </div>

    </main>
  )
}
