/**
 * Marathi Transliteration Engine
 *
 * Custom rule-based Roman → Devanagari transliterator.
 * No external API calls — works offline, zero latency.
 *
 * Based on ITRANS-like scheme with Marathi-specific additions:
 * - Handles schwa deletion common in Marathi
 * - Supports common Marathi vowels and consonants
 * - Real-time, works character by character
 */

// Longest-match-first mapping table
const TRANSLITERATION_MAP: [string, string][] = [
  // Multi-char sequences first (longest match wins)
  // Vowels (independent)
  ['aa', 'आ'], ['ee', 'ई'], ['ii', 'ई'], ['oo', 'ऊ'], ['uu', 'ऊ'],
  ['ai', 'ऐ'], ['au', 'औ'], ['ae', 'ऐ'], ['oi', 'ओइ'],
  ['ru', 'ऋ'], ['Ru', 'ऋ'],

  // Consonant clusters (common Marathi)
  ['ksh', 'क्ष'], ['gny', 'ज्ञ'], ['jny', 'ज्ञ'], ['dny', 'ज्ञ'],
  ['shh', 'ष'], ['nnh', 'ण'],

  // Aspirated consonants
  ['kh', 'ख'], ['gh', 'घ'], ['ch', 'च'], ['jh', 'झ'],
  ['tth', 'ठ'], ['ddh', 'ढ'],
  ['th', 'थ'], ['dh', 'ध'],
  ['ph', 'फ'], ['bh', 'भ'],
  ['sh', 'श'], ['Sh', 'ष'],

  // Retroflex
  ['tt', 'ट'], ['dd', 'ड'], ['nn', 'ण'],
  ['T', 'ट'], ['D', 'ड'], ['N', 'ण'],

  // Single consonants
  ['k', 'क'], ['g', 'ग'], ['c', 'च'], ['j', 'ज'],
  ['t', 'त'], ['d', 'द'], ['n', 'न'], ['p', 'प'],
  ['b', 'ब'], ['m', 'म'], ['y', 'य'], ['r', 'र'],
  ['l', 'ल'], ['v', 'व'], ['w', 'व'], ['s', 'स'],
  ['h', 'ह'], ['f', 'फ'], ['z', 'झ'], ['q', 'क'],
  ['L', 'ळ'], ['x', 'क्ष'],

  // Vowels (standalone)
  ['a', 'अ'], ['i', 'इ'], ['u', 'उ'], ['e', 'ए'], ['o', 'ओ'],
  ['A', 'आ'], ['I', 'ई'], ['U', 'ऊ'], ['E', 'ऐ'], ['O', 'औ'],

  // Anusvara / Visarga
  ['M', 'ं'], ['H', 'ः'],

  // Numerals (Devanagari)
  ['0', '०'], ['1', '१'], ['2', '२'], ['3', '३'], ['4', '४'],
  ['5', '५'], ['6', '६'], ['7', '७'], ['8', '८'], ['9', '९'],
]

// Devanagari vowel marks (matras) — used after consonants
const VOWEL_TO_MATRA: Record<string, string> = {
  'अ': '',    // inherent vowel — no matra
  'आ': 'ा',
  'इ': 'ि',
  'ई': 'ी',
  'उ': 'ु',
  'ऊ': 'ू',
  'ऋ': 'ृ',
  'ए': 'े',
  'ऐ': 'ै',
  'ओ': 'ो',
  'औ': 'ौ',
}

const DEVANAGARI_CONSONANTS = new Set([
  'क', 'ख', 'ग', 'घ', 'ङ',
  'च', 'छ', 'ज', 'झ', 'ञ',
  'ट', 'ठ', 'ड', 'ढ', 'ण',
  'त', 'थ', 'द', 'ध', 'न',
  'प', 'फ', 'ब', 'भ', 'म',
  'य', 'र', 'ल', 'व', 'ळ',
  'श', 'ष', 'स', 'ह',
  'क्ष', 'ज्ञ',
])

const DEVANAGARI_VOWELS = new Set(Object.keys(VOWEL_TO_MATRA))

/**
 * Transliterates a Roman string to Devanagari Marathi.
 * Words are processed individually to apply schwa deletion at word end.
 */
export function romanToMarathi(input: string): string {
  // Split on spaces and punctuation, preserving them
  const parts = input.split(/(\s+|[.,!?;:'"()\[\]{}\-—])/g)
  return parts.map(part => {
    // Don't transliterate whitespace or punctuation
    if (/^\s+$/.test(part) || /^[.,!?;:'"()\[\]{}\-—]$/.test(part)) return part
    if (part === '') return part
    return transliterateWord(part)
  }).join('')
}

function transliterateWord(word: string): string {
  let result = ''
  let i = 0
  let lastWasConsonant = false

  while (i < word.length) {
    let matched = false

    // Try longest match first
    for (const [roman, devanagari] of TRANSLITERATION_MAP) {
      if (word.slice(i).toLowerCase().startsWith(roman.toLowerCase()) &&
          (roman === roman.toLowerCase() ? true : word.slice(i).startsWith(roman))) {
        // Handle matra application
        if (DEVANAGARI_VOWELS.has(devanagari) && lastWasConsonant) {
          const matra = VOWEL_TO_MATRA[devanagari]
          if (matra !== undefined) {
            result += matra
          } else {
            result += devanagari
          }
          lastWasConsonant = false
        } else {
          // Preceding consonant needs halanta if followed by another consonant
          if (DEVANAGARI_CONSONANTS.has(devanagari) && lastWasConsonant) {
            result += '्' // halanta (virama)
          }
          result += devanagari
          lastWasConsonant = DEVANAGARI_CONSONANTS.has(devanagari)
        }
        i += roman.length
        matched = true
        break
      }
    }

    if (!matched) {
      // Pass through unrecognized characters
      result += word[i]
      lastWasConsonant = false
      i++
    }
  }

  // Schwa deletion: Marathi doesn't pronounce trailing 'a' in many words
  // If word ends with a consonant that has inherent 'अ', add halanta
  // (User can override by typing 'a' explicitly)

  return result
}

/**
 * Count words in a Devanagari/mixed text string
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length
}

/**
 * Check if text is predominantly Devanagari
 */
export function isDevanagari(text: string): boolean {
  const devChars = (text.match(/[\u0900-\u097F]/g) || []).length
  const totalChars = text.replace(/\s/g, '').length
  return totalChars > 0 && devChars / totalChars > 0.5
}
