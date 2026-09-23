
import { NextRequest, NextResponse } from 'next/server'
import { getFromCache } from '@/lib/transliteration/highFreqCache'
import { romanToMarathi } from '@/lib/transliteration/mapper'
import { recordTransliterationAttempt } from '@/lib/transliteration/metrics'
import { db } from '@/lib/db'
import { transliterationOverrides } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

interface TransliterateResult {
  word: string
  transliteration: string
  candidates: string[]
  source: 'override' | 'cache' | 'google' | 'fallback'
  latencyMs: number
}

async function processTransliteration(rawWord: string): Promise<TransliterateResult> {
  const startTime = Date.now()
  const word = rawWord.trim()

  if (!word) {
    return {
      word: '',
      transliteration: '',
      candidates: [],
      source: 'cache',
      latencyMs: 0,
    }
  }

  // ── Tier 0: Custom Admin Overrides ──
  try {
    const overrideResult = await db
      .select()
      .from(transliterationOverrides)
      .where(eq(transliterationOverrides.word, word.toLowerCase()))
    
    if (overrideResult.length > 0) {
      const latencyMs = Date.now() - startTime
      return {
        word,
        transliteration: overrideResult[0].override,
        candidates: [overrideResult[0].override],
        source: 'override',
        latencyMs,
      }
    }
  } catch (err) {
    console.error('[Transliteration] Failed to check overrides', err)
  }

  // ── Tier 1: High-Frequency Cache (Instant, 0 Network) ──
  const cached = getFromCache(word)
  if (cached && cached.length > 0) {
    const latencyMs = Date.now() - startTime
    recordTransliterationAttempt('cache', latencyMs)
    return {
      word,
      transliteration: cached[0],
      candidates: cached,
      source: 'cache',
      latencyMs,
    }
  }

  // ── Tier 2: Google Input Tools API (with 3-second timeout) ──
  try {
    const googleUrl = `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=mr-t-i0-und&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8`
    const res = await fetch(googleUrl, {
      signal: AbortSignal.timeout(3000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (res.ok) {
      const data = await res.json()
      // Google Input Tools response format:
      // ["SUCCESS", [["word", ["कुठे", "कुठं", ...], ...]]]
      if (
        Array.isArray(data) &&
        data[0] === 'SUCCESS' &&
        Array.isArray(data[1]) &&
        Array.isArray(data[1][0]) &&
        Array.isArray(data[1][0][1]) &&
        data[1][0][1].length > 0
      ) {
        const candidates = data[1][0][1] as string[]
        const latencyMs = Date.now() - startTime
        recordTransliterationAttempt('google', latencyMs)
        return {
          word,
          transliteration: candidates[0],
          candidates,
          source: 'google',
          latencyMs,
        }
      }
    }
  } catch (err) {
    console.warn(`[Transliteration] Google API unreachable for "${word}". Falling back to local rules.`, err)
  }

  // ── Tier 3: Local Rule-Based Fallback (Offline Resilience) ──
  try {
    const fallbackTransliteration = romanToMarathi(word)
    const latencyMs = Date.now() - startTime
    recordTransliterationAttempt('fallback', latencyMs)
    return {
      word,
      transliteration: fallbackTransliteration,
      candidates: [fallbackTransliteration],
      source: 'fallback',
      latencyMs,
    }
  } catch {
    const latencyMs = Date.now() - startTime
    recordTransliterationAttempt('fallback', latencyMs)
    return {
      word,
      transliteration: word,
      candidates: [word],
      source: 'fallback',
      latencyMs,
    }
  }
}

// GET /api/transliterate?text=kuthe
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const text = searchParams.get('text') || searchParams.get('word') || ''
  const result = await processTransliteration(text)
  return NextResponse.json(result)
}

// POST /api/transliterate body: { word: "kuthe" }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const text = body.word || body.text || ''
    const result = await processTransliteration(text)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request' }, { status: 400 })
  }
}
