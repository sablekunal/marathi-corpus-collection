
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  respondentSessions,
  responses,
  responseQualityMetrics,
  typingMetrics,
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { checkQuality } from '@/lib/quality/checks'

const TypingMetricsSchema = z.object({
  totalDurationMs: z.number().int().optional().default(0),
  activeDurationMs: z.number().int().optional().default(0),
  idleDurationMs: z.number().int().optional().default(0),
  wordsTyped: z.number().int().optional().default(0),
  charsTyped: z.number().int().optional().default(0),
  typingSpeedWpm: z.number().optional().default(0),
})

const ResponseItemSchema = z.object({
  questionId: z.string(),
  responseText: z.string(),
  minWords: z.number().int().optional().default(8),
  pasteAttempts: z.number().int().optional().default(0),
  typingMetrics: TypingMetricsSchema.optional(),
})

const SubmitSchema = z.object({
  sessionId: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
  responses: z.array(ResponseItemSchema).min(1),
  comments: z.string().optional().default(''),
})

// POST /api/responses/submit
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = SubmitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const { sessionId } = data

    // Verify session exists and not already submitted
    const [session] = await db.select().from(respondentSessions).where(eq(respondentSessions.id, sessionId))
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 404 })
    if (session.submittedAt) return NextResponse.json({ error: 'Already submitted' }, { status: 409 })

    // Update session metadata, paste attempts, and consent
    const totalPasteAttempts = data.responses.reduce((acc, r) => acc + (r.pasteAttempts ?? 0), 0)
    const meta = (data.metadata || {}) as Record<string, unknown>
    const consentResearch = meta.consentResearch === true || meta.consentResearch === 'true'
    const consentAI = meta.consentAI === true || meta.consentAI === 'true'
    const consentTimestamp = typeof meta.consentTimestamp === 'string' ? meta.consentTimestamp : new Date().toISOString()

    await db.update(respondentSessions).set({
      metadata: JSON.stringify(data.metadata),
      pasteAttempts: totalPasteAttempts,
      submittedAt: new Date().toISOString(),
      consentResearch,
      consentAI,
      consentTimestamp,
    }).where(eq(respondentSessions.id, sessionId))

    // Insert each response
    for (const resp of data.responses) {
      const responseId = nanoid()
      const text = resp.responseText.trim()
      const quality = checkQuality(text, resp.minWords ?? 8)

      // Insert response
      await db.insert(responses).values({
        id: responseId,
        sessionId,
        questionId: resp.questionId,
        responseText: text,
        wordCount: quality.wordCount,
        charCount: quality.charCount,
      })

      // Insert quality metrics
      await db.insert(responseQualityMetrics).values({
        id: nanoid(),
        responseId,
        pasteAttempts: resp.pasteAttempts ?? 0,
        qualityScore: quality.score,
        repeatedTextDetected: quality.flags.repeatedText,
        mostlyEnglish: quality.flags.mostlyEnglish,
        mostlyNumbers: quality.flags.mostlyNumbers,
        charRepetition: quality.flags.charRepetition,
        flagged: !quality.passed || quality.score < 50,
        flagReason: quality.warnings.join('; '),
      })

      // Insert typing metrics
      if (resp.typingMetrics) {
        const tm = resp.typingMetrics
        await db.insert(typingMetrics).values({
          id: nanoid(),
          responseId,
          totalDurationMs: tm.totalDurationMs ?? 0,
          activeDurationMs: tm.activeDurationMs ?? 0,
          idleDurationMs: tm.idleDurationMs ?? 0,
          wordsTyped: tm.wordsTyped ?? 0,
          charsTyped: tm.charsTyped ?? 0,
          typingSpeedWpm: tm.typingSpeedWpm ?? 0,
        })
      }
    }

    return NextResponse.json({ success: true, sessionId }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/responses/submit]', err)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}
