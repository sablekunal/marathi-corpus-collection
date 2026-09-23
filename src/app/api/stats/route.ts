export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  respondentSessions,
  responses,
} from '@/lib/db/schema'
import { sql, count, sum } from 'drizzle-orm'

/**
 * Public (unauthenticated) API endpoint returning aggregate stats only.
 * No personally identifiable information is exposed.
 *
 * GET /api/stats
 */
export async function GET() {
  try {
    // Total submitted sessions
    const [{ totalSubmissions }] = await db
      .select({ totalSubmissions: count() })
      .from(respondentSessions)
      .where(sql`submitted_at IS NOT NULL`)

    // Total individual responses (questions answered)
    const [{ totalResponses }] = await db
      .select({ totalResponses: count() })
      .from(responses)

    // Total words collected
    const [{ totalWords }] = await db
      .select({ totalWords: sum(responses.wordCount) })
      .from(responses)

    // Unique dialects (from session metadata JSON)
    const dialectRows = await db
      .select({
        dialect: sql<string>`json_extract(metadata, '$.dialect')`,
        count: count(),
      })
      .from(respondentSessions)
      .where(sql`submitted_at IS NOT NULL AND json_extract(metadata, '$.dialect') IS NOT NULL`)
      .groupBy(sql`json_extract(metadata, '$.dialect')`)
      .orderBy(sql`count(*) DESC`)

    // Unique districts (from session metadata JSON)
    const districtRows = await db
      .select({
        district: sql<string>`json_extract(metadata, '$.district')`,
        count: count(),
      })
      .from(respondentSessions)
      .where(sql`submitted_at IS NOT NULL AND json_extract(metadata, '$.district') IS NOT NULL AND json_extract(metadata, '$.district') != ''`)
      .groupBy(sql`json_extract(metadata, '$.district')`)
      .orderBy(sql`count(*) DESC`)

    // Today's new responses
    const [{ todayCount }] = await db
      .select({ todayCount: count() })
      .from(respondentSessions)
      .where(sql`submitted_at IS NOT NULL AND date(submitted_at) = date('now')`)

    // Goal progress
    const goal = 500
    const progressPercent = totalSubmissions > 0 
      ? Math.min(100, Math.round((totalSubmissions / goal) * 100)) 
      : 0

    return NextResponse.json({
      totalSubmissions: totalSubmissions || 0,
      totalResponses: totalResponses || 0,
      totalWords: Number(totalWords) || 0,
      todayCount: todayCount || 0,
      dialectCount: dialectRows.length,
      districtCount: districtRows.length,
      dialectBreakdown: dialectRows.map(d => ({
        name: d.dialect || 'Unknown',
        count: d.count,
      })),
      districtBreakdown: districtRows.map(d => ({
        name: d.district || 'Unknown',
        count: d.count,
      })),
      goal,
      progressPercent,
    })
  } catch (err) {
    console.error('[GET /api/stats]', err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
