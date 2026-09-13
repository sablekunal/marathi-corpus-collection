'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { UserCheck, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'

export const MAHARASHTRA_DISTRICTS = [
  'अहमदनगर', 'अकोला', 'अमरावती', 'छत्रपती संभाजीनगर (औरंगाबाद)', 'बीड', 'भंडारा',
  'बुलढाणा', 'चंद्रपूर', 'धुळे', 'गडचिरोली', 'गोंदिया', 'हिंगोली', 'जळगाव',
  'जालना', 'कोल्हापूर', 'लातूर', 'मुंबई शहर', 'मुंबई उपनगर', 'नागपूर',
  'नांदेड', 'नंदुरबार', 'नाशिक', 'धाराशिव (उस्मानाबाद)', 'पालघर', 'परभणी',
  'पुणे', 'रायगड', 'रत्नागिरी', 'सांगली', 'सातारा', 'सिंधुदुर्ग', 'सोलापूर',
  'ठाणे', 'वर्धा', 'वाशीम', 'यवतमाळ', 'महाराष्ट्र बाहेरील'
]

export const MARATHI_DIALECTS = [
  'प्रमाण मराठी (Standard Marathi)',
  'वऱ्हाडी (Varhadi / Vidarbha)',
  'खानदेशी / अहिराणी (Khandeshi / Ahirani)',
  'कोकणी (Konkani Marathi)',
  'मालवणी (Malvani)',
  'मराठवाड्यातील मराठी (Marathwada)',
  'कोल्हापुरी / चंदगडी (Kolhapuri / Chandgadi)',
  'देशी / पश्चिम महाराष्ट्र (Deshi / Western Maharashtra)',
  'इतर (Other)'
]

interface MetadataFormProps {
  metadataConfig?: Record<string, boolean>
  onSubmit: (data: Record<string, string>) => void
}

export function MetadataForm({ metadataConfig = {}, onSubmit }: MetadataFormProps) {
  const [district, setDistrict] = useState('')
  const [taluka, setTaluka] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [gender, setGender] = useState('')
  const [education, setEducation] = useState('')
  const [dialect, setDialect] = useState('')
  const [isNativeSpeaker, setIsNativeSpeaker] = useState('होय')
  const [consentResearch, setConsentResearch] = useState(false)
  const [consentAI, setConsentAI] = useState(false)

  // Check if at least some fields are enabled
  const showDistrict = metadataConfig.district !== false
  const showAge = metadataConfig.ageGroup !== false
  const showGender = metadataConfig.gender !== false
  const showEducation = metadataConfig.education !== false
  const showDialect = metadataConfig.dialect !== false
  const showNative = metadataConfig.nativeSpeaker !== false

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!consentResearch || !consentAI) return
    onSubmit({
      district,
      taluka,
      ageGroup,
      gender,
      education,
      dialect,
      isNativeSpeaker,
      consentResearch: 'true',
      consentAI: 'true',
      consentTimestamp: new Date().toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-sm text-blue-900">
        <UserCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold">संशोधन माहिती (Participant Profile)</h4>
          <p className="text-xs text-blue-700/90 mt-0.5">
            सदर माहिती केवळ भाषिक संशोधन व विश्लेषणासाठी वापरली जाईल. आपली वैयक्तिक ओळख गोपनीय ठेवली जाईल.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {showDistrict && (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">जिल्हा (District) *</Label>
            <Select
              value={district}
              onValueChange={(val: string | null) => {
                if (val) setDistrict(val)
              }}
              required
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="आपला जिल्हा निवडा" />
              </SelectTrigger>
              <SelectContent>
                {MAHARASHTRA_DISTRICTS.map(d => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showDistrict && (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">तालुका / शहर (Taluka / City)</Label>
            <Input
              value={taluka}
              onChange={e => setTaluka(e.target.value)}
              placeholder="उदा. हवेली, बारामती, नागपूर"
              className="bg-white"
            />
          </div>
        )}

        {showDialect && (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">बोलीभाषा (Primary Marathi Dialect)</Label>
            <Select
              value={dialect}
              onValueChange={(val: string | null) => {
                if (val) setDialect(val)
              }}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="बोलीभाषा निवडा" />
              </SelectTrigger>
              <SelectContent>
                {MARATHI_DIALECTS.map(d => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showAge && (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">वयोगट (Age Group)</Label>
            <Select
              value={ageGroup}
              onValueChange={(val: string | null) => {
                if (val) setAgeGroup(val)
              }}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="वयोगट निवडा" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="18-24">18 – 24 वर्षे</SelectItem>
                <SelectItem value="25-34">25 – 34 वर्षे</SelectItem>
                <SelectItem value="35-44">35 – 44 वर्षे</SelectItem>
                <SelectItem value="45-54">45 – 54 वर्षे</SelectItem>
                <SelectItem value="55+">55 वर्षे किंवा अधिक</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {showGender && (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">लिंग (Gender)</Label>
            <Select
              value={gender}
              onValueChange={(val: string | null) => {
                if (val) setGender(val)
              }}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="निवडा" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="पुरुष">पुरुष (Male)</SelectItem>
                <SelectItem value="स्त्री">स्त्री (Female)</SelectItem>
                <SelectItem value="इतर">इतर (Other)</SelectItem>
                <SelectItem value="सांगू इच्छित नाही">सांगू इच्छित नाही (Prefer not to say)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {showEducation && (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">शिक्षण (Education)</Label>
            <Select
              value={education}
              onValueChange={(val: string | null) => {
                if (val) setEducation(val)
              }}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="शिक्षण निवडा" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="शालेय">शालेय (Up to 10th)</SelectItem>
                <SelectItem value="उच्च माध्यमिक">उच्च माध्यमिक (12th / Diploma)</SelectItem>
                <SelectItem value="पदवी">पदवी (Graduate)</SelectItem>
                <SelectItem value="पदव्युत्तर">पदव्युत्तर (Post Graduate)</SelectItem>
                <SelectItem value="डॉक्टरेट">डॉक्टरेट / संशोधन (Ph.D / Research)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {showNative && (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">मराठी ही आपली मातृभाषा आहे का?</Label>
            <Select
              value={isNativeSpeaker}
              onValueChange={(val: string | null) => {
                if (val) setIsNativeSpeaker(val)
              }}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="निवडा" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="होय">होय (Yes, Native Speaker)</SelectItem>
                <SelectItem value="नाही">नाही (No, Second Language)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* ── Consent Section (Ethics & Data Governance) ── */}
      <div className="bg-slate-50 border-l-4 border-[oklch(0.42_0.16_250)] p-4 rounded-r-xl space-y-3.5 shadow-2xs">
        <div>
          <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[oklch(0.42_0.16_250)]" />
            <span>मजकूर वापराची परवानगी (Data Consent & Ethics) *</span>
          </h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            आपले प्रतिसाद निनावी ठेवले जातील आणि केवळ भाषिक संशोधनासाठी वापरले जातील.
            <span className="text-[11px] text-slate-500 block">
              (Your responses will be anonymized and used solely for linguistic research.)
            </span>
          </p>
        </div>

        {/* Research Consent Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
          <input
            type="checkbox"
            checked={consentResearch}
            onChange={e => setConsentResearch(e.target.checked)}
            className="mt-1 w-4 h-4 accent-[oklch(0.42_0.16_250)] rounded cursor-pointer"
            required
          />
          <div className="flex-1">
            <span className="block text-xs font-semibold text-slate-900">
              मी माझा मजकूर शैक्षणिक व भाषिक संशोधनासाठी खुला (CC-BY-4.0) करण्यास संमती देतो/देते.
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              I consent to my text being used for academic research under CC-BY-4.0 license
            </span>
          </div>
        </label>

        {/* AI Training Consent Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
          <input
            type="checkbox"
            checked={consentAI}
            onChange={e => setConsentAI(e.target.checked)}
            className="mt-1 w-4 h-4 accent-[oklch(0.42_0.16_250)] rounded cursor-pointer"
            required
          />
          <div className="flex-1">
            <span className="block text-xs font-semibold text-slate-900">
              सदर डेटा कृत्रिम बुद्धिमत्ता (AI) मॉडेल्सच्या प्रशिक्षणासाठी वापरण्यास माझी हरकत नाही.
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              I understand this data may be used to train AI language models
            </span>
          </div>
        </label>

        {/* Privacy Notice */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-2.5 flex items-start gap-2.5 text-amber-900 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-[11px]">
            <div>
              <strong>गोपनीयता (Privacy):</strong> आपला IP पत्ता सुरक्षितपणे SHA-256 हॅश केला जाईल आणि १८० दिवसांनंतर हटवला जाईल.
            </div>
            <div className="text-amber-700">
              Your IP address will be hashed (SHA-256) and automatically deleted after 180 days.
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={!consentResearch || !consentAI}
          className="w-full h-12 bg-[oklch(0.42_0.16_250)] hover:bg-[oklch(0.35_0.14_250)] disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-base font-medium rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <span>प्रश्नांची उत्तरे देण्यास प्रारंभ करा</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
        {(!consentResearch || !consentAI) && (
          <p className="text-center text-[11px] text-rose-500 mt-2 font-medium">
            * पुढे जाण्यासाठी कृपया वरील दोन्ही संमती (Consent) चौकटी निवडा.
          </p>
        )}
      </div>
    </form>
  )
}
