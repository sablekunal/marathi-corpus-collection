import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  responses,
  questions,
  respondentSessions,
  responseQualityMetrics,
  typingMetrics,
} from '@/lib/db/schema'
import { eq, like, or, and, desc, sql } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const queryStr = searchParams.get('query') || ''
    
    const offset = (page - 1) * limit

    let baseQuery = db
      .select({
        responseId: responses.id,
        sessionId: responses.sessionId,
        category: questions.category,
        questionText: questions.question,
        responseText: responses.responseText,
        wordCount: responses.wordCount,
        charCount: responses.charCount,
        submittedAt: responses.submittedAt,
        sessionMetadata: respondentSessions.metadata,
        qualityScore: responseQualityMetrics.qualityScore,
        pasteAttempts: responseQualityMetrics.pasteAttempts,
        flagged: responseQualityMetrics.flagged,
        flagReason: responseQualityMetrics.flagReason,
        typingSpeedWpm: typingMetrics.typingSpeedWpm,
        activeDurationMs: typingMetrics.activeDurationMs,
      })
      .from(responses)
      .innerJoin(respondentSessions, eq(responses.sessionId, respondentSessions.id))
      .innerJoin(questions, eq(responses.questionId, questions.id))
      .leftJoin(responseQualityMetrics, eq(responseQualityMetrics.responseId, responses.id))
      .leftJoin(typingMetrics, eq(typingMetrics.responseId, responses.id))
      .$dynamic()

    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(responses)
      .innerJoin(respondentSessions, eq(responses.sessionId, respondentSessions.id))
      .innerJoin(questions, eq(responses.questionId, questions.id))
      .$dynamic()

    if (queryStr) {
      const searchCondition = or(
        like(responses.responseText, `%${queryStr}%`),
        like(questions.category, `%${queryStr}%`)
      )
      baseQuery = baseQuery.where(searchCondition)
      countQuery = countQuery.where(searchCondition)
    }

    const [totalResult, dataResult] = await Promise.all([
      countQuery,
      baseQuery.orderBy(desc(responses.submittedAt)).limit(limit).offset(offset)
    ])

    const total = totalResult[0].count

    const mappedData = dataResult.map(r => ({
      responseId: r.responseId,
      sessionId: r.sessionId,
      category: r.category,
      questionText: r.questionText,
      responseText: r.responseText,
      wordCount: r.wordCount ?? 0,
      charCount: r.charCount ?? 0,
      submittedAt: r.submittedAt ?? '',
      qualityScore: r.qualityScore ?? 100,
      pasteAttempts: r.pasteAttempts ?? 0,
      flagged: r.flagged ?? false,
      flagReason: r.flagReason ?? '',
      typingSpeedWpm: r.typingSpeedWpm ?? 0,
      activeDurationMs: r.activeDurationMs ?? 0,
      metadata: JSON.parse(r.sessionMetadata ?? '{}'),
    }))

    return NextResponse.json({
      data: mappedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (err) {
    console.error('[GET /api/admin/responses]', err)
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 })
  }
}
