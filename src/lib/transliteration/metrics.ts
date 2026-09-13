/**
 * Transliteration Reliability & Latency Telemetry
 * Tracks performance across the 3 tiers: Cache, Google API, and Local Fallback.
 */

export interface TransliterationMetrics {
  totalAttempts: number
  cacheHits: number
  googleHits: number
  fallbackHits: number
  avgLatencyMs: number
  cacheHitRate: number
  googleHitRate: number
  fallbackHitRate: number
  successRate: number
}

// In-memory telemetry state
const telemetryState = {
  totalAttempts: 0,
  cacheHits: 0,
  googleHits: 0,
  fallbackHits: 0,
  totalLatencyMs: 0,
}

export function recordTransliterationAttempt(
  source: 'cache' | 'google' | 'fallback',
  latencyMs: number,
) {
  telemetryState.totalAttempts += 1
  telemetryState.totalLatencyMs += latencyMs

  if (source === 'cache') telemetryState.cacheHits += 1
  else if (source === 'google') telemetryState.googleHits += 1
  else if (source === 'fallback') telemetryState.fallbackHits += 1
}

export function getTransliterationMetrics(): TransliterationMetrics {
  const { totalAttempts, cacheHits, googleHits, fallbackHits, totalLatencyMs } = telemetryState

  const cacheHitRate = totalAttempts > 0 ? Math.round((cacheHits / totalAttempts) * 100) : 0
  const googleHitRate = totalAttempts > 0 ? Math.round((googleHits / totalAttempts) * 100) : 0
  const fallbackHitRate = totalAttempts > 0 ? Math.round((fallbackHits / totalAttempts) * 100) : 0
  const successRate = totalAttempts > 0 ? Math.round(((cacheHits + googleHits) / totalAttempts) * 100) : 100
  const avgLatencyMs = totalAttempts > 0 ? Math.round(totalLatencyMs / totalAttempts) : 0

  return {
    totalAttempts,
    cacheHits,
    googleHits,
    fallbackHits,
    avgLatencyMs,
    cacheHitRate,
    googleHitRate,
    fallbackHitRate,
    successRate,
  }
}
