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

export const MAHARASHTRA_TALUKAS: Record<string, string[]> = {
  'अहमदनगर': ['अकोले', 'जामखेड', 'कर्जत', 'कोपरगाव', 'नगर', 'नेवासा', 'पारनेर', 'पाथर्डी', 'राहाता', 'राहुरी', 'संगमनेर', 'शेवगाव', 'श्रीगोंदा', 'श्रीरामपूर'],
  'अकोला': ['अकोट', 'अकोला', 'तेल्हारा', 'पातूर', 'बार्शीटाकळी', 'बाळापूर', 'मूर्तीजापूर'],
  'अमरावती': ['अचलपूर', 'अमरावती', 'अंजनगाव सुर्जी', 'चांदूर बाजार', 'चांदूर रेल्वे', 'चिखलदरा', 'दर्यापूर', 'धामणगाव रेल्वे', 'धारणी', 'नांदगाव खंडेश्वर', 'भातकुली', 'मोर्शी', 'वरुड'],
  'छत्रपती संभाजीनगर (औरंगाबाद)': ['औरंगाबाद', 'कन्नड', 'खुलताबाद', 'गंगापूर', 'पैठण', 'फुलंब्री', 'वैजापूर', 'सिल्लोड', 'सोयगाव'],
  'बीड': ['आंबेजोगाई', 'आष्टी', 'केज', 'गेवराई', 'धारूर', 'पाटोदा', 'परळी', 'बीड', 'माजलगाव', 'शिरूर (कासार)', 'वडवणी'],
  'भंडारा': ['भंडारा', 'लाखांदूर', 'लाखनी', 'मोहाडी', 'पवनी', 'साकोली', 'तुमसर'],
  'बुलढाणा': ['बुलढाणा', 'चिखली', 'देऊळगाव राजा', 'जळगाव जामोद', 'खामगाव', 'लोणार', 'मलकापूर', 'मेहकर', 'मोताळा', 'नांदुरा', 'संग्रामपूर', 'शेगाव', 'सिंदखेड राजा'],
  'चंद्रपूर': ['बल्लारपूर', 'भद्रावती', 'ब्रह्मपुरी', 'चंद्रपूर', 'चिमूर', 'गोंडपिपरी', 'जिवती', 'कोरपना', 'मूल', 'नागभीड', 'पोंभुर्णा', 'राजुरा', 'सावली', 'सिंदेवाही', 'वरोरा'],
  'धुळे': ['धुळे', 'साक्री', 'शिरपूर', 'शिंदखेडा'],
  'गडचिरोली': ['अहेरी', 'आरमोरी', 'भामरागड', 'चामोर्शी', 'देसाईगंज', 'धानोरा', 'एटापल्ली', 'गडचिरोली', 'कोरची', 'कुरखेडा', 'मुलचेरा', 'सिरोंचा'],
  'गोंदिया': ['आमगाव', 'अर्जुनी मोरगाव', 'देवरी', 'गोंदिया', 'गोरेगाव', 'सडक अर्जुनी', 'सालेकसा', 'तिरोडा'],
  'हिंगोली': ['औंढा नागनाथ', 'बसमत', 'हिंगोली', 'कळमनुरी', 'सेनगाव'],
  'जळगाव': ['अमळनेर', 'भडगाव', 'भुसावळ', 'बोदवड', 'चाळीसगाव', 'चोपडा', 'धरणगाव', 'एरंडोल', 'जळगाव', 'जामनेर', 'मुक्ताईनगर', 'पाचोरा', 'पारोळा', 'रावेर', 'यावल'],
  'जालना': ['अंबड', 'बदनापूर', 'भोकरदन', 'घनसावंगी', 'जालना', 'मंठा', 'परतूर', 'जाफ्राबाद'],
  'कोल्हापूर': ['आजरा', 'भुदरगड', 'चंदगड', 'गडहिंग्लज', 'गगनबावडा', 'हातकणंगले', 'कागल', 'करवीर', 'पन्हाळा', 'राधानगरी', 'शाहूवाडी', 'शिरोळ'],
  'लातूर': ['अहमदपूर', 'औसा', 'चाकूर', 'देवणी', 'जळकोट', 'लातूर', 'निलंगा', 'रेणापूर', 'शिरूर अनंतपाळ', 'उदगीर'],
  'मुंबई शहर': ['मुंबई शहर'],
  'मुंबई उपनगर': ['कुर्ला', 'अंधेरी', 'बोरिवली', 'मालाड'],
  'नागपूर': ['भिवापूर', 'हिंगणा', 'कळमेश्वर', 'कामठी', 'काटोल', 'कुही', 'मौदा', 'नागपूर (ग्रामिण)', 'नागपूर (शहर)', 'नरखेड', 'पारशिवनी', 'रामटेक', 'सावनेर', 'उमरेड'],
  'नांदेड': ['अर्धापूर', 'भोकर', 'बिलोली', 'देगलूर', 'धर्माबाद', 'हदगाव', 'हिमायतनगर', 'कंधार', 'किनवट', 'लोहा', 'माहूर', 'मुदखेड', 'मुखेड', 'नांदेड', 'नायगाव', 'उमरी'],
  'नंदुरबार': ['अक्कलकुवा', 'अक्राणी', 'नंदुरबार', 'नवापूर', 'शहादा', 'तळोदा'],
  'नाशिक': ['बागलाण', 'चांदवड', 'देवळा', 'दिंडोरी', 'इगतपुरी', 'कळवण', 'मालेगाव', 'नांदगाव', 'नाशिक', 'निफाड', 'पेठ', 'सिन्नर', 'सुरगाणा', 'त्र्यंबकेश्वर', 'येवला'],
  'धाराशिव (उस्मानाबाद)': ['भूम', 'कळंब', 'लोहारा', 'उमरगा', 'उस्मानाबाद', 'परंडा', 'तुळजापूर', 'वाशी'],
  'पालघर': ['डहाणू', 'जव्हार', 'मोखाडा', 'पालघर', 'तलासरी', 'वसई', 'वाडा', 'विक्रमगड'],
  'परभणी': ['गंगाखेड', 'जिंतूर', 'मानवत', 'पाथरी', 'परभणी', 'पालम', 'पूर्णा', 'सोनपेठ', 'सेलू'],
  'पुणे': ['आंबेगाव', 'बारामती', 'भोर', 'दौंड', 'हवेली', 'इंदापूर', 'जुन्नर', 'खेड', 'मावळ', 'मुळशी', 'पुरंदर', 'शिरूर', 'वेल्हे', 'पुणे शहर'],
  'रायगड': ['अलिबाग', 'कर्जत', 'खालापूर', 'महाड', 'माणगाव', 'म्हासळा', 'मुरुड', 'पनवेल', 'पेण', 'पोलादपूर', 'रोहा', 'श्रीवर्धन', 'सुधागड', 'तळा', 'उरण'],
  'रत्नागिरी': ['चिपळूण', 'दापोली', 'गुहागर', 'खेड', 'लांजा', 'मंडणगड', 'राजापूर', 'रत्नागिरी', 'संगमेश्वर'],
  'सांगली': ['आटपाडी', 'जत', 'कड़ेगाव', 'कवठे महांकाळ', 'खानापूर', 'मिरज', 'पलूस', 'शिराळा', 'तासगाव', 'वाळवा'],
  'सातारा': ['खटाव', 'कोरेगाव', 'खंडाळा', 'महाबळेश्वर', 'माण', 'पाटण', 'फलटण', 'सातारा', 'कराड', 'जावळी', 'वाई'],
  'सिंधुदुर्ग': ['देवगड', 'दोडामार्ग', 'कणकवली', 'कुडाळ', 'मालवण', 'वेंगुर्ला', 'वैभववाडी', 'सावंतवाडी'],
  'सोलापूर': ['अक्कलकोट', 'बार्शी', 'करमाळा', 'माढा', 'माळशिरस', 'मंगळवेढा', 'मोहोळ', 'पंढरपूर', 'सांगोला', 'दक्षिण सोलापूर', 'उत्तर सोलापूर'],
  'ठाणे': ['अंबरनाथ', 'भिवंडी', 'कल्याण', 'मुरबाड', 'शहापूर', 'ठाणे', 'उल्हासनगर'],
  'वर्धा': ['आर्वी', 'आष्टी', 'देवळी', 'हिंगणघाट', 'कारंजा', 'समुद्रपूर', 'सेलू', 'वर्धा'],
  'वाशीम': ['कारंजा', 'मालेगाव', 'मंगरूळपीर', 'मानोरा', 'रिसोड', 'वाशीम'],
  'यवतमाळ': ['आर्णी', 'बाभूळगाव', 'दारव्हा', 'दिग्रस', 'घाटंजी', 'कळंब', 'केळापूर', 'महागाव', 'मारेगाव', 'नेर', 'पुसद', 'राळेगाव', 'उमरखेड', 'वणी', 'यवतमाळ', 'झरी जामणी'],
  'महाराष्ट्र बाहेरील': []
}

export const DISTRICT_DIALECT_MAP: Record<string, string> = {
  'अहमदनगर': 'देशी / पश्चिम महाराष्ट्र (Deshi / Western Maharashtra)',
  'अकोला': 'वऱ्हाडी (Varhadi / Vidarbha)',
  'अमरावती': 'वऱ्हाडी (Varhadi / Vidarbha)',
  'छत्रपती संभाजीनगर (औरंगाबाद)': 'मराठवाड्यातील मराठी (Marathwada)',
  'बीड': 'मराठवाड्यातील मराठी (Marathwada)',
  'भंडारा': 'वऱ्हाडी (Varhadi / Vidarbha)',
  'बुलढाणा': 'वऱ्हाडी (Varhadi / Vidarbha)',
  'चंद्रपूर': 'वऱ्हाडी (Varhadi / Vidarbha)',
  'धुळे': 'खानदेशी / अहिराणी (Khandeshi / Ahirani)',
  'गडचिरोली': 'वऱ्हाडी (Varhadi / Vidarbha)',
  'गोंदिया': 'वऱ्हाडी (Varhadi / Vidarbha)',
  'हिंगोली': 'मराठवाड्यातील मराठी (Marathwada)',
  'जळगाव': 'खानदेशी / अहिराणी (Khandeshi / Ahirani)',
  'जालना': 'मराठवाड्यातील मराठी (Marathwada)',
  'कोल्हापूर': 'कोल्हापुरी / चंदगडी (Kolhapuri / Chandgadi)',
  'लातूर': 'मराठवाड्यातील मराठी (Marathwada)',
  'मुंबई शहर': 'कोकणी (Konkani Marathi)',
  'मुंबई उपनगर': 'कोकणी (Konkani Marathi)',
  'नागपूर': 'वऱ्हाडी (Varhadi / Vidarbha)',
  'नांदेड': 'मराठवाड्यातील मराठी (Marathwada)',
  'नंदुरबार': 'खानदेशी / अहिराणी (Khandeshi / Ahirani)',
  'नाशिक': 'देशी / पश्चिम महाराष्ट्र (Deshi / Western Maharashtra)',
  'धाराशिव (उस्मानाबाद)': 'मराठवाड्यातील मराठी (Marathwada)',
  'पालघर': 'कोकणी (Konkani Marathi)',
  'परभणी': 'मराठवाड्यातील मराठी (Marathwada)',
  'पुणे': 'देशी / पश्चिम महाराष्ट्र (Deshi / Western Maharashtra)',
  'रायगड': 'कोकणी (Konkani Marathi)',
  'रत्नागिरी': 'कोकणी (Konkani Marathi)',
  'सांगली': 'देशी / पश्चिम महाराष्ट्र (Deshi / Western Maharashtra)',
  'सातारा': 'देशी / पश्चिम महाराष्ट्र (Deshi / Western Maharashtra)',
  'सिंधुदुर्ग': 'मालवणी (Malvani)',
  'सोलापूर': 'देशी / पश्चिम महाराष्ट्र (Deshi / Western Maharashtra)',
  'ठाणे': 'कोकणी (Konkani Marathi)',
  'वर्धा': 'वऱ्हाडी (Varhadi / Vidarbha)',
  'वाशीम': 'वऱ्हाडी (Varhadi / Vidarbha)',
  'यवतमाळ': 'वऱ्हाडी (Varhadi / Vidarbha)',
  'महाराष्ट्र बाहेरील': 'इतर (Other)'
}

interface MetadataFormProps {
  metadataConfig?: Record<string, boolean>
  onSubmit: (data: Record<string, string>) => void
}

export function MetadataForm({ metadataConfig = {}, onSubmit }: MetadataFormProps) {
  const [district, setDistrict] = useState('')
  const [taluka, setTaluka] = useState('')
  const [customTaluka, setCustomTaluka] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [gender, setGender] = useState('')
  const [education, setEducation] = useState('')
  const [isNativeSpeaker, setIsNativeSpeaker] = useState('होय')
  const [consentResearch, setConsentResearch] = useState(false)
  const [consentAI, setConsentAI] = useState(false)

  // Check if at least some fields are enabled
  const showDistrict = metadataConfig.district !== false
  const showAge = metadataConfig.ageGroup !== false
  const showGender = metadataConfig.gender !== false
  const showEducation = metadataConfig.education !== false
  const showNative = metadataConfig.nativeSpeaker !== false

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!consentResearch || !consentAI) return

    const finalTaluka = taluka === 'इतर (Other)' ? customTaluka : taluka
    let computedDialect = DISTRICT_DIALECT_MAP[district] || 'इतर (Other)'
    
    // Fine-tune dialect based on taluka if needed
    if (district === 'कोल्हापूर' && finalTaluka === 'चंदगड') {
      computedDialect = 'कोल्हापुरी / चंदगडी (Kolhapuri / Chandgadi)'
    }

    onSubmit({
      district,
      taluka: finalTaluka,
      ageGroup,
      gender,
      education,
      dialect: computedDialect,
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

      {/* ── Dialect Reassurance Banner ──────────────────────────────── */}
      <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-900">
        <span className="text-lg shrink-0">✍️</span>
        <div>
          <p className="font-semibold font-marathi text-amber-900">
            तुम्ही तुमच्या घरगुती, स्थानिक किंवा दैनंदिन बोलीभाषेत लिहू शकता.
          </p>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            व्याकरणाच्या किंवा शुद्धलेखनाच्या चुकांची काळजी करू नका — आम्हाला आपली नैसर्गिक मराठी हवी आहे!
            <span className="block text-amber-700 mt-0.5">
              You can write in your everyday, local dialect. Don&apos;t worry about grammar or spelling — we want your natural Marathi!
            </span>
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
                if (val) {
                  setDistrict(val)
                  setTaluka('')
                  setCustomTaluka('')
                }
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
            <Label className="text-xs font-semibold text-slate-700">तालुका / शहर (Taluka / City) *</Label>
            <Select
              value={taluka}
              onValueChange={(val: string | null) => {
                if (val) setTaluka(val)
              }}
              disabled={!district}
              required
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder={district ? "आपला तालुका निवडा" : "प्रथम जिल्हा निवडा"} />
              </SelectTrigger>
              <SelectContent>
                {(MAHARASHTRA_TALUKAS[district] || []).map(t => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
                <SelectItem value="इतर (Other)">इतर (Other)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {showDistrict && taluka === 'इतर (Other)' && (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">इतर तालुका / शहर (Other Taluka / City) *</Label>
            <Input
              value={customTaluka}
              onChange={e => setCustomTaluka(e.target.value)}
              placeholder="कृपया आपला तालुका प्रविष्ट करा"
              className="bg-white"
              required
            />
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
