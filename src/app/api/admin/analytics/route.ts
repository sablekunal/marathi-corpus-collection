import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  responses,
  questions,
  respondentSessions,
  responseQualityMetrics,
  typingMetrics,
  forms,
} from '@/lib/db/schema'
import { eq, count, avg, sql, and } from 'drizzle-orm'
import { getTransliterationMetrics } from '@/lib/transliteration/metrics'

// GET /api/admin/analytics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const formId = searchParams.get('formId')

    // Total submitted sessions
    const sessionFilter = formId
      ? and(eq(respondentSessions.formId, formId), sql`submitted_at IS NOT NULL`)
      : sql`submitted_at IS NOT NULL`

    const [{ totalSubmissions }] = await db
      .select({ totalSubmissions: count() })
      .from(respondentSessions)
      .where(sessionFilter)

    // Total sessions started
    const startedFilter = formId ? eq(respondentSessions.formId, formId) : undefined
    const [{ totalStarted }] = await db
      .select({ totalStarted: count() })
      .from(respondentSessions)
      .where(startedFilter)

    // Total responses
    const [{ totalResponses }] = await db
      .select({ totalResponses: count() })
      .from(responses)

    // Average word count
    const [{ avgWordCount }] = await db
      .select({ avgWordCount: avg(responses.wordCount) })
      .from(responses)

    // Average quality score
    const [{ avgQuality }] = await db
      .select({ avgQuality: avg(responseQualityMetrics.qualityScore) })
      .from(responseQualityMetrics)

    // Category distribution
    const categoryDist = await db
      .select({
        category: questions.category,
        count: count(),
      })
      .from(responses)
      .innerJoin(questions, eq(responses.questionId, questions.id))
      .groupBy(questions.category)

    // Daily response trend (last 30 days)
    const dailyTrend = await db
      .select({
        date: sql<string>`date(submitted_at)`,
        count: count(),
      })
      .from(respondentSessions)
      .where(sql`submitted_at IS NOT NULL AND submitted_at >= datetime('now', '-30 days')`)
      .groupBy(sql`date(submitted_at)`)
      .orderBy(sql`date(submitted_at)`)

    // Flagged responses count
    const [{ flaggedCount }] = await db
      .select({ flaggedCount: count() })
      .from(responseQualityMetrics)
      .where(eq(responseQualityMetrics.flagged, true))

    // Paste attempts stats
    const [{ totalPasteAttempts }] = await db
      .select({ totalPasteAttempts: sql<number>`SUM(paste_attempts)` })
      .from(respondentSessions)

    const completionRate = totalStarted > 0
      ? Math.round((totalSubmissions / totalStarted) * 100)
      : 0

    // Transliteration telemetry metrics
    const transliterationMetrics = getTransliterationMetrics()

    return NextResponse.json({
      totalSubmissions,
      totalStarted,
      totalResponses,
      completionRate,
      avgWordCount: Math.round(Number(avgWordCount) || 0),
      avgQualityScore: Math.round(Number(avgQuality) || 0),
      flaggedCount,
      totalPasteAttempts: totalPasteAttempts || 0,
      categoryDistribution: categoryDist,
      dailyTrend,
      transliterationMetrics,
    })
  } catch (err) {
    console.error('[GET /api/admin/analytics]', err)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
