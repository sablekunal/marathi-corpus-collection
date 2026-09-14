/**
 * Dataset Export Generators
 * Exports response data as CSV, JSON, or JSONL (HuggingFace-compatible)
 */

import { db } from '@/lib/db'
import {
  responses,
  questions,
  respondentSessions,
  responseQualityMetrics,
  typingMetrics,
} from '@/lib/db/schema'
import { eq, gte, lte, and } from 'drizzle-orm'

interface ExportRecord {
  response_id: string
  session_id: string
  form_id: string
  question_id: string
  category: string
  question_text: string
  response_text: string
  word_count: number
  char_count: number
  submitted_at: string
  quality_score: number
  paste_attempts: number
  flagged: boolean
  flag_reason: string
  typing_speed_wpm: number
  active_duration_ms: number
  metadata: Record<string, unknown>
}

export interface ExportFilters {
  formId?: string
  minQuality?: number
  startDate?: string
  endDate?: string
}

export async function getExportData(filters: ExportFilters = {}): Promise<ExportRecord[]> {
  const { formId, minQuality, startDate, endDate } = filters
  // Build query
  let query = db
    .select({
      responseId: responses.id,
      sessionId: responses.sessionId,
      formId: respondentSessions.formId,
      questionId: responses.questionId,
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

  const conditions = []
  if (formId) conditions.push(eq(respondentSessions.formId, formId))
  if (minQuality !== undefined) conditions.push(gte(responseQualityMetrics.qualityScore, minQuality))
  if (startDate) conditions.push(gte(responses.submittedAt, startDate))
  if (endDate) conditions.push(lte(responses.submittedAt, endDate))

  if (conditions.length > 0) {
    query = query.where(and(...conditions))
  }

  const allResponses = await query

  return allResponses.map(r => ({
    response_id: r.responseId,
    session_id: r.sessionId,
    form_id: r.formId,
    question_id: r.questionId,
    category: r.category,
    question_text: r.questionText,
    response_text: r.responseText,
    word_count: r.wordCount ?? 0,
    char_count: r.charCount ?? 0,
    submitted_at: r.submittedAt ?? '',
    quality_score: r.qualityScore ?? 100,
    paste_attempts: r.pasteAttempts ?? 0,
    flagged: r.flagged ?? false,
    flag_reason: r.flagReason ?? '',
    typing_speed_wpm: r.typingSpeedWpm ?? 0,
    active_duration_ms: r.activeDurationMs ?? 0,
    metadata: JSON.parse(r.sessionMetadata ?? '{}'),
  }))
}

export function toCSV(records: ExportRecord[]): string {
  if (records.length === 0) return ''

  const keys = Object.keys(records[0]) as (keyof ExportRecord)[]
  const header = keys.join(',')

  const rows = records.map(record =>
    keys.map(key => {
      const val = record[key]
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')
      // Escape CSV: wrap in quotes if contains comma, quote, or newline
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }).join(','),
  )

  return [header, ...rows].join('\n')
}

export function toJSON(records: ExportRecord[]): string {
  return JSON.stringify(records, null, 2)
}

export function toJSONL(records: ExportRecord[]): string {
  return records.map(r => JSON.stringify(r)).join('\n')
}
