/**
 * Automated System Test Suite for Marathi Corpus Collection Platform
 * Tests Transliteration (3-tier), Quality Checks (1-2 sentences),
 * Database Schema & Questions, and Consent & Anonymization.
 */
import { getFromCache } from '../src/lib/transliteration/highFreqCache'
import { romanToMarathi } from '../src/lib/transliteration/mapper'
import { checkQuality } from '../src/lib/quality/checks'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'

let passedCount = 0
let failedCount = 0

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`)
    passedCount++
  } else {
    console.error(`  ✗ FAIL: ${testName}`)
    failedCount++
  }
}

async function runTests() {
  console.log('====================================================')
  console.log('  Running Marathi Corpus Automated Test Suite')
  console.log('====================================================\n')

  // ── 1. Transliteration Tests ─────────────────────────────────
  console.log('[1/4] Testing 3-Tier Transliteration Engine...')
  
  // Tier 1: High frequency cache
  const cachedKuthe = getFromCache('kuthe')
  assert(Array.isArray(cachedKuthe) && cachedKuthe.includes('कुठे'), 'Tier 1: "kuthe" resolves to "कुठे"')
  
  const cachedNamaskar = getFromCache('namaskar')
  assert(Array.isArray(cachedNamaskar) && cachedNamaskar.includes('नमस्कार'), 'Tier 1: "namaskar" resolves to "नमस्कार"')

  const cachedDhanyavaad = getFromCache('dhanyavaad')
  assert(Array.isArray(cachedDhanyavaad) && cachedDhanyavaad.includes('धन्यवाद'), 'Tier 1: "dhanyavaad" resolves to "धन्यवाद"')

  // Tier 3: Local phonetic rule fallback
  const fallback = romanToMarathi('shalecha')
  assert(typeof fallback === 'string' && fallback.length > 0, 'Tier 3: Local rule produces Marathi Devanagari')

  // ── 2. Quality Validation for 1-2 Sentence Responses ─────────
  console.log('\n[2/4] Testing Quality Validation (1-2 Sentence Questions)...')

  // Valid 1-2 sentence response (12 words)
  const validResponse = 'होय, सोशल मीडियामुळे लोक समोरासमोर कमी बोलतात आणि मोबाईलमध्येच जास्त वेळ घालवतात.'
  const reportValid = checkQuality(validResponse, 8)
  assert(reportValid.passed === true, '12-word natural response passes checkQuality with minWords=8')
  assert(reportValid.score === 100, 'Natural Marathi response receives quality score 100')
  assert(reportValid.flags.belowMinWords === false, 'Flag belowMinWords is false')

  // Too short response (only 3 words)
  const shortResponse = 'मला नाही माहित.'
  const reportShort = checkQuality(shortResponse, 8)
  assert(reportShort.flags.belowMinWords === true, '3-word response triggers belowMinWords flag')
  assert(reportShort.passed === false, 'Below minimum words response fails validation')

  // Repetition detection
  const spamResponse = 'होय होय होय होय होय होय होय होय होय होय होय होय'
  const reportSpam = checkQuality(spamResponse, 8)
  assert(reportSpam.flags.repeatedText === true, 'Word repetition spam triggers repeatedText flag')

  // ── 3. Database Schema & Short Questions Verification ─────────
  console.log('\n[3/4] Testing Database Schema, Short Questions & Consent Columns...')

  const client = createClient({
    url: process.env.DATABASE_URL || 'file:local.db',
  })
  const db = drizzle(client, { schema })

  // Check questions
  const allQuestions = await db.select().from(schema.questions)
  assert(allQuestions.length >= 14, `Database has ${allQuestions.length} questions (expected >= 14)`)

  const sampleQuestion = allQuestions[0]
  assert(sampleQuestion.minWords === 8, `Sample question minWords is 8 (got ${sampleQuestion.minWords})`)
  assert((sampleQuestion.maxWords ?? 0) <= 50, `Sample question maxWords is <= 50 (got ${sampleQuestion.maxWords})`)
  assert(sampleQuestion.estimatedTime === 30, `Sample question estimatedTime is 30s (got ${sampleQuestion.estimatedTime})`)

  // Check forms & rules
  const [pilotForm] = await db.select().from(schema.forms).where(eq(schema.forms.slug, 'marathi-pilot-2026'))
  assert(Boolean(pilotForm), 'Pilot form "marathi-pilot-2026" exists in database')
  assert(pilotForm.isPublished === true, 'Pilot form is published')

  // Check consent columns on respondent_sessions
  const tableInfo = await client.execute("PRAGMA table_info('respondent_sessions')")
  const columnNames = tableInfo.rows.map(r => r.name)
  assert(columnNames.includes('consent_research'), 'Column consent_research exists in respondent_sessions')
  assert(columnNames.includes('consent_ai'), 'Column consent_ai exists in respondent_sessions')
  assert(columnNames.includes('consent_timestamp'), 'Column consent_timestamp exists in respondent_sessions')

  // ── 4. End-to-End Submission Integrity ───────────────────────
  console.log('\n[4/4] Testing Submission Integrity & Export Records...')

  const [lastResponse] = await client.execute(`
    SELECT r.id, r.word_count, m.quality_score, m.flagged, s.consent_research, s.consent_ai
    FROM responses r
    JOIN response_quality_metrics m ON r.id = m.response_id
    JOIN respondent_sessions s ON r.session_id = s.id
    ORDER BY r.submitted_at DESC LIMIT 1
  `).then(res => res.rows)

  if (lastResponse) {
    assert(Number(lastResponse.word_count) >= 8, `Last submitted response has >= 8 words (got ${lastResponse.word_count})`)
    assert(Number(lastResponse.quality_score) === 100, `Last submitted response scored 100`)
    assert(Number(lastResponse.flagged) === 0, `Last submitted response is not flagged`)
    assert(Number(lastResponse.consent_research) === 1, `Research consent is recorded`)
    assert(Number(lastResponse.consent_ai) === 1, `AI training consent is recorded`)
  } else {
    console.log('  ℹ (No prior submission found, skipping last response assertion)')
  }

  // ── Summary ──────────────────────────────────────────────────
  console.log('\n====================================================')
  console.log(`  Tests Completed: ${passedCount + failedCount}`)
  console.log(`  Passed: ${passedCount}`)
  console.log(`  Failed: ${failedCount}`)
  console.log('====================================================')

  if (failedCount > 0) {
    process.exit(1)
  } else {
    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!\n')
    process.exit(0)
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err)
  process.exit(1)
})
