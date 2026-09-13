import Link from 'next/link'
import { ShieldCheck, Clock, Lock, FileText, ArrowLeft, Mail } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy & Data Governance | मराठी भाषा संग्रह',
  description: 'Ethical data governance, participant consent terms, and anonymization policies for the Marathi Corpus Collection Platform.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-[oklch(0.97_0.01_250)] to-slate-100 py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[oklch(0.42_0.16_250)] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>मुख्य पानावर परत जा (Back to Home)</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-[oklch(0.88_0.02_250)] p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 text-[oklch(0.42_0.16_250)] rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-marathi">
                गोपनीयता धोरण व डेटा प्रशासन (Privacy & Data Governance)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            मराठी भाषा संशोधन प्रकल्पांतर्गत संकलित केलेल्या सर्व प्रतिसादांचे संरक्षण, संशोधकीय वापर आणि गोपनीयता याविषयीची सविस्तर नियमावली येथे स्पष्ट केली आहे.
            The Marathi Corpus Collection Platform collects text data and linguistic metadata from native speakers strictly for academic research and computational linguistics.
          </p>
        </div>

        {/* What Data We Collect */}
        <section className="bg-white rounded-2xl border border-[oklch(0.88_0.02_250)] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <FileText className="w-5 h-5 text-[oklch(0.42_0.16_250)]" />
            <h2>संकलित केला जाणारा डेटा (What Data We Collect)</h2>
          </div>
          <ul className="text-xs sm:text-sm text-slate-600 space-y-2.5 list-disc pl-5 leading-relaxed">
            <li>
              <strong>लिखित मजकूर (Text Responses):</strong> सहभागींनी स्वतः मराठीत टाईप केलेली मुक्त उत्तरे (विविध विषयांवरील मते, अनुभव व वर्णने).
            </li>
            <li>
              <strong>भाषिक व लोकसंख्याशास्त्रीय माहिती (Sociolinguistic Metadata):</strong> जिल्हा, बोलीभाषा (Dialect), वयोगट, लिंग, शिक्षण व मातृभाषा स्थिती. (कोणतेही वैयक्तिक नाव, फोन नंबर किंवा ई-मेल पत्ता संकलित केला जात नाही).
            </li>
            <li>
              <strong>टायपिंग गती व गुणवत्ता मापदंड (Typing Dynamics):</strong> टायपिंगसाठी लागलेला एकूण वेळ, सक्रिय वेळ आणि टायपिंग गती (WPM) — ही माहिती केवळ डेटा अस्सल असण्याची खात्री करण्यासाठी वापरली जाते.
            </li>
            <li>
              <strong>तांत्रिक नोंदी (Technical Logs):</strong> ब्राऊझर माहिती (User Agent) आणि सुरक्षित SHA-256 हॅश केलेला IP पत्ता. कच्चा IP पत्ता डेटाबेसमध्ये कधीही साठवला जात नाही.
            </li>
          </ul>
        </section>

        {/* Retention Schedule Table */}
        <section className="bg-white rounded-2xl border border-[oklch(0.88_0.02_250)] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Clock className="w-5 h-5 text-[oklch(0.42_0.16_250)]" />
            <h2>डेटा साठवणूक कालावधी (Data Retention Schedule)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">डेटा प्रकार (Data Type)</th>
                  <th className="p-3">साठवणूक कालावधी (Retention Period)</th>
                  <th className="p-3">तपशील (Details)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-3 font-medium text-slate-800">IP पत्ता (Hashed IP)</td>
                  <td className="p-3 font-semibold text-emerald-700">१८० दिवस (180 days)</td>
                  <td className="p-3">SHA-256 क्रिप्टोग्राफिक हॅश; १८० दिवसांनंतर आपोआप नष्ट केला जातो.</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">लिखित प्रतिसाद (Responses)</td>
                  <td className="p-3 font-semibold text-blue-700">संशोधनासाठी कायमस्वरूपी (Indefinite)</td>
                  <td className="p-3">CC-BY-4.0 खुल्या शैक्षणिक परवान्यांतर्गत संपूर्णपणे निनावी रूपात प्रकाशित.</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">टायपिंग नोंदी (Typing Metrics)</td>
                  <td className="p-3 font-semibold text-slate-700">१ वर्ष (1 year)</td>
                  <td className="p-3">गुणवत्ता पडताळणीनंतर सांख्यिकी स्वरूपात एकत्रित (Aggregated).</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">संमती नोंदी (Consent Records)</td>
                  <td className="p-3 font-semibold text-slate-700">३ वर्षे (3 years)</td>
                  <td className="p-3">शैक्षणिक व नैतिक मानदंडांच्या पडताळणीसाठी.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Ethical Safeguards & Rights */}
        <section className="bg-white rounded-2xl border border-[oklch(0.88_0.02_250)] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Lock className="w-5 h-5 text-[oklch(0.42_0.16_250)]" />
            <h2>सहभागींचे हक्क व नैतिकता (Participant Rights & Ethics)</h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              <strong>१. निनावीकरण (Complete Anonymity):</strong> कोणताही प्रतिसाद विशिष्ट व्यक्तीशी जोडता येत नाही.
            </p>
            <p>
              <strong>२. खुला शैक्षणिक परवाना (Open License):</strong> सर्व डेटा Creative Commons Attribution 4.0 International (<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="text-blue-600 underline">CC-BY-4.0</a>) परवान्यांतर्गत उपलब्ध केला जातो, ज्यामुळे भारतीय भाषांतील संशोधनाला गती मिळते.
            </p>
            <p>
              <strong>३. प्रतिसाद वगळण्याचा हक्क (Right to Deletion):</strong> कोणत्याही सहभागीने स्वतःचे उत्तर मागे घेण्याची विनंती केल्यास ती ३० दिवसांच्या आत डेटाबेसमधून काढून टाकली जाईल.
            </p>
          </div>

          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex items-start gap-3 mt-4">
            <Mail className="w-5 h-5 text-[oklch(0.42_0.16_250)] shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 space-y-1">
              <div className="font-semibold">संपर्क व अधिक माहिती (Research Inquiry & Data Requests)</div>
              <div>
                डेटा संरक्षण किंवा संशोधनाविषयी कोणत्याही शंकेसाठी संपर्क: <a href="mailto:marathi.nlp.research@gmail.com" className="font-medium text-blue-700 underline">marathi.nlp.research@gmail.com</a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 py-4">
          मराठी भाषा संग्रह प्रकल्प • Marathi Linguistic Corpus Initiative
        </div>
      </div>
    </main>
  )
}
