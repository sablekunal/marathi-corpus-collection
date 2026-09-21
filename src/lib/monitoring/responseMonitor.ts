/**
 * Daily monitoring report for Marathi Corpus Collection.
 *
 * Queries the database for today's collection progress and sends
 * a formatted report to Slack (if webhook configured) or console.
 */
import { db } from '@/lib/db'
import {
  respondentSessions,
  responses,
  responseQualityMetrics,
} from '@/lib/db/schema'
import { sql, count, avg, sum, eq } from 'drizzle-orm'

export interface DailyReport {
  todayResponses: number
  totalResponses: number
  totalWords: number
  avgQuality: number
  flaggedCount: number
  dialectBreakdown: { name: string; count: number }[]
  goalPercent: number
}

export async function getDailyReport(): Promise<DailyReport> {
  // Today's new submissions
  const [{ todayCount }] = await db
    .select({ todayCount: count() })
    .from(respondentSessions)
    .where(sql`submitted_at IS NOT NULL AND date(submitted_at) = date('now')`)

  // Total submitted sessions
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(respondentSessions)
    .where(sql`submitted_at IS NOT NULL`)

  // Total words
  const [{ totalWords }] = await db
    .select({ totalWords: sum(responses.wordCount) })
    .from(responses)

  // Average quality score
  const [{ avgQuality }] = await db
    .select({ avgQuality: avg(responseQualityMetrics.qualityScore) })
    .from(responseQualityMetrics)

  // Flagged count
  const [{ flaggedCount }] = await db
    .select({ flaggedCount: count() })
    .from(responseQualityMetrics)
    .where(eq(responseQualityMetrics.flagged, true))

  // Dialect breakdown
  const dialectRows = await db
    .select({
      dialect: sql<string>`json_extract(metadata, '$.dialect')`,
      count: count(),
    })
    .from(respondentSessions)
    .where(sql`submitted_at IS NOT NULL AND json_extract(metadata, '$.dialect') IS NOT NULL`)
    .groupBy(sql`json_extract(metadata, '$.dialect')`)
    .orderBy(sql`count(*) DESC`)

  const goal = 500

  return {
    todayResponses: todayCount || 0,
    totalResponses: totalCount || 0,
    totalWords: Number(totalWords) || 0,
    avgQuality: Number(avgQuality) || 0,
    flaggedCount: flaggedCount || 0,
    dialectBreakdown: dialectRows.map(d => ({
      name: d.dialect || 'Unknown',
      count: d.count,
    })),
    goalPercent: totalCount > 0 ? Math.round((totalCount / goal) * 100) : 0,
  }
}

export function formatReport(report: DailyReport): string {
  const dialectList = report.dialectBreakdown
    .slice(0, 5)
    .map(d => `  • ${d.name}: ${d.count}`)
    .join('\n')

  return `
📊 Marathi Corpus — Daily Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Today: ${report.todayResponses} new responses
📈 Total: ${report.totalResponses} responses
✍️ Words: ${report.totalWords.toLocaleString()}
⭐ Quality: ${report.avgQuality.toFixed(1)}/100
🚩 Flagged: ${report.flaggedCount}

🎯 Progress toward 500: ${report.goalPercent}%
${'█'.repeat(Math.floor(report.goalPercent / 5))}${'░'.repeat(20 - Math.floor(report.goalPercent / 5))} ${report.goalPercent}%

🗣️ Top Dialects:
${dialectList || '  (no data yet)'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim()
}

export async function sendDailyReport(): Promise<void> {
  const report = await getDailyReport()
  const message = formatReport(report)

  // Send to Slack if webhook is configured
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      })
      if (res.ok) {
        console.log('✅ Report sent to Slack successfully.')
      } else {
        console.error('❌ Slack webhook returned:', res.status, await res.text())
      }
    } catch (err) {
      console.error('❌ Failed to send to Slack:', err)
    }
  } else {
    console.log('ℹ️  No SLACK_WEBHOOK_URL configured. Printing report to console:\n')
  }

  // Always log to console as well
  console.log(message)
}
