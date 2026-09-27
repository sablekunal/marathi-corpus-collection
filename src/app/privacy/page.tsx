import Link from 'next/link'

export const metadata = {
  title: 'गोपनीयता धोरण (Privacy Policy) | Marathi Corpus',
}

export default function PrivacyPage() {
  return (
    <main className="w-full flex-1 flex flex-col max-w-2xl mx-auto px-4 py-8">
      
      <div className="mb-8">
        <h1 className="font-marathi text-[24px] sm:text-[28px] font-bold text-[#0F172A] mb-2 leading-tight">
          गोपनीयता धोरण आणि डेटा वापर <br className="hidden sm:block" /> 
          <span className="text-[18px] sm:text-[20px] font-medium text-slate-500">(Privacy & Research Data Policy)</span>
        </h1>
        <p className="font-marathi text-[15px] text-[#0F172A] mt-2">मराठी भाषा संग्रह (Marathi Language Corpus for NLP Research)</p>
      </div>

      <div className="space-y-6">
        <section className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">person_off</span>
            </span>
            <h2 className="font-marathi text-[16px] sm:text-[18px] font-bold text-[#0F172A]">१. निनावीकरण (Complete Anonymity)</h2>
          </div>
          <p className="font-marathi text-[15px] text-[#0F172A] leading-[1.6] pl-11">
            वापरकर्त्याचे नाव, फोन नंबर किंवा ईमेल पत्ता विचारला जात नाही किंवा साठवला जात नाही. <br />
            <span className="text-[13px] text-slate-500 font-normal">(No PII like names, phone numbers, or emails are ever requested or stored.)</span>
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">security</span>
            </span>
            <h2 className="font-marathi text-[16px] sm:text-[18px] font-bold text-[#0F172A]">२. IP पत्ता आणि सुरक्षा (IP Hashing & Retention)</h2>
          </div>
          <p className="font-marathi text-[15px] text-[#0F172A] leading-[1.6] pl-11">
            स्पॅम नियंत्रणासाठी सर्व्हर केवळ एकतर्फी SHA-256 हॅश केलेला IP पत्ता तात्पुरता ठेवतो. हा हॅश १८० दिवसांनंतर डेटाबेसमधून आपोआप कायमचा नष्ट केला जातो. <br />
            <span className="text-[13px] text-slate-500 font-normal">(IP addresses are one-way hashed using SHA-256 for spam prevention and auto-purged after 180 days.)</span>
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">public</span>
            </span>
            <h2 className="font-marathi text-[16px] sm:text-[18px] font-bold text-[#0F172A]">३. डेटा वापर आणि CC BY 4.0 परवाना (Open Data License)</h2>
          </div>
          <p className="font-marathi text-[15px] text-[#0F172A] leading-[1.6] pl-11">
            गोळा केलेला सर्व मजकूर साफसफाई (preprocessing and normalization) करून शैक्षणिक संस्था, संशोधक आणि कृत्रिम बुद्धिमत्ता (LLM) मॉडेल्सच्या प्रशिक्षणासाठी CC BY 4.0 परवान्याअंतर्गत खुला करण्यात येईल. <br />
            <span className="text-[13px] text-slate-500 font-normal">(All collected text will be normalized and released under the CC BY 4.0 Open Research License to train AI models.)</span>
          </p>
        </section>
      </div>

      <div className="mt-10 mb-4">
        <Link 
          href="/" 
          className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-slate-100 border border-slate-200 text-[#0F172A] font-marathi text-[15px] font-semibold hover:bg-slate-200 transition-colors gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> ← मुख्य पृष्ठावर परत जा
        </Link>
      </div>

    </main>
  )
}
