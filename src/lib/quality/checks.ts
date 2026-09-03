/**
 * Response Quality Checks
 * Validates Marathi text corpus submissions before storing.
 */

export interface QualityReport {
  passed: boolean
  wordCount: number
  charCount: number
  warnings: string[]
  flags: {
    belowMinWords: boolean
    repeatedText: boolean
    charRepetition: boolean
    mostlyEnglish: boolean
    mostlyNumbers: boolean
    emptyContent: boolean
    tooShort: boolean
  }
  score: number // 0–100
}

export function checkQuality(text: string, minWords: number): QualityReport {
  const trimmed = text.trim()
  const words = trimmed.split(/\s+/).filter(w => w.length > 0)
  const wordCount = words.length
  const charCount = trimmed.length

  const flags = {
    belowMinWords: wordCount < minWords,
    emptyContent: charCount === 0,
    tooShort: charCount < 10,
    repeatedText: hasRepeatedText(trimmed),
    charRepetition: hasCharRepetition(trimmed),
    mostlyEnglish: isMostlyEnglish(trimmed),
    mostlyNumbers: isMostlyNumbers(trimmed),
  }

  const warnings: string[] = []
  let score = 100

  if (flags.emptyContent) {
    warnings.push('उत्तर रिकामे आहे. कृपया उत्तर लिहा.')
    score -= 50
  }
  if (flags.belowMinWords && !flags.emptyContent) {
    warnings.push(`किमान ${minWords} शब्द आवश्यक आहेत. तुम्ही ${wordCount} शब्द लिहिले आहेत.`)
    score -= 30
  }
  if (flags.repeatedText) {
    warnings.push('उत्तरात पुनरावृत्ती आढळली. कृपया वेगळे उत्तर लिहा.')
    score -= 20
  }
  if (flags.charRepetition) {
    warnings.push('अक्षरांची जास्त पुनरावृत्ती आढळली (उदा. aaaaaaa).')
    score -= 15
  }
  if (flags.mostlyEnglish) {
    warnings.push('हे उत्तर मुख्यतः इंग्रजीत आहे. कृपया मराठीत लिहा.')
    score -= 25
  }
  if (flags.mostlyNumbers) {
    warnings.push('उत्तरात जास्त संख्या आढळल्या. कृपया पूर्ण वाक्ये लिहा.')
    score -= 20
  }

  score = Math.max(0, score)

  const passed = !flags.emptyContent && !flags.belowMinWords

  return { passed, wordCount, charCount, warnings, flags, score }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function hasRepeatedText(text: string): boolean {
  if (text.length < 20) return false
  // Check for repeated n-grams (3+ word sequences)
  const words = text.split(/\s+/)
  if (words.length < 6) return false

  const trigrams = new Map<string, number>()
  for (let i = 0; i < words.length - 2; i++) {
    const gram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`
    const count = (trigrams.get(gram) || 0) + 1
    trigrams.set(gram, count)
    if (count >= 3) return true // trigram repeated 3+ times
  }
  return false
}

function hasCharRepetition(text: string): boolean {
  // Check for 5+ consecutive same characters
  return /(.)\1{4,}/u.test(text)
}

function isMostlyEnglish(text: string): boolean {
  const stripped = text.replace(/\s+/g, '')
  if (stripped.length === 0) return false
  const latinChars = (stripped.match(/[a-zA-Z]/g) || []).length
  return latinChars / stripped.length > 0.65
}

function isMostlyNumbers(text: string): boolean {
  const stripped = text.replace(/\s+/g, '')
  if (stripped.length === 0) return false
  const numChars = (stripped.match(/[\d०-९]/g) || []).length
  return numChars / stripped.length > 0.5
}
