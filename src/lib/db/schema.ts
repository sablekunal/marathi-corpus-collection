import { sql } from 'drizzle-orm'
import {
  integer,
  real,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core'

// ── Questions ────────────────────────────────────────────────────────────────

export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  category: text('category').notNull(),
  question: text('question').notNull(),
  description: text('description').default(''),
  required: integer('required', { mode: 'boolean' }).default(true),
  minWords: integer('min_words').default(8),
  maxWords: integer('max_words').default(50),
  language: text('language').default('marathi'),
  enabled: integer('enabled', { mode: 'boolean' }).default(true),
  difficulty: text('difficulty').default('easy'),
  estimatedTime: integer('estimated_time').default(30),
  tags: text('tags').default('[]'), // JSON array string
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// ── Forms ────────────────────────────────────────────────────────────────────

export const forms = sqliteTable('forms', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').default(''),
  slug: text('slug').notNull().unique(),
  isPublished: integer('is_published', { mode: 'boolean' }).default(false),
  isClosed: integer('is_closed', { mode: 'boolean' }).default(false),
  transliterationEnabled: integer('transliteration_enabled', { mode: 'boolean' }).default(true),
  antiPasteEnabled: integer('anti_paste_enabled', { mode: 'boolean' }).default(true),
  metadataConfig: text('metadata_config').default('{}'), // JSON
  commentsEnabled: integer('comments_enabled', { mode: 'boolean' }).default(false),
  questionsPerForm: integer('questions_per_form').default(3),
  maxResponses: integer('max_responses').default(0), // 0 = unlimited
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
})

// ── Form Question Rules ───────────────────────────────────────────────────────

export const formQuestionRules = sqliteTable('form_question_rules', {
  id: text('id').primaryKey(),
  formId: text('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  category: text('category').notNull(),
  count: integer('count').default(1),
})

// ── Respondent Sessions ───────────────────────────────────────────────────────

export const respondentSessions = sqliteTable('respondent_sessions', {
  id: text('id').primaryKey(),
  formId: text('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  startedAt: text('started_at').default(sql`(datetime('now'))`),
  submittedAt: text('submitted_at'),
  userAgent: text('user_agent').default(''),
  ipHash: text('ip_hash').default(''), // hashed for privacy
  metadata: text('metadata').default('{}'), // JSON: district, age, etc.
  pasteAttempts: integer('paste_attempts').default(0),
  consentResearch: integer('consent_research', { mode: 'boolean' }).default(false),
  consentAI: integer('consent_ai', { mode: 'boolean' }).default(false),
  consentTimestamp: text('consent_timestamp').default(sql`(datetime('now'))`),
})

// ── Assigned Question Sets ────────────────────────────────────────────────────

export const assignedQuestionSets = sqliteTable('assigned_question_sets', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => respondentSessions.id, { onDelete: 'cascade' }),
  questionId: text('question_id').notNull().references(() => questions.id),
  questionOrder: integer('question_order').notNull(),
  assignedAt: text('assigned_at').default(sql`(datetime('now'))`),
})

// ── Responses ─────────────────────────────────────────────────────────────────

export const responses = sqliteTable('responses', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => respondentSessions.id, { onDelete: 'cascade' }),
  questionId: text('question_id').notNull().references(() => questions.id),
  responseText: text('response_text').notNull(),
  wordCount: integer('word_count').default(0),
  charCount: integer('char_count').default(0),
  submittedAt: text('submitted_at').default(sql`(datetime('now'))`),
})

// ── Response Quality Metrics ──────────────────────────────────────────────────

export const responseQualityMetrics = sqliteTable('response_quality_metrics', {
  id: text('id').primaryKey(),
  responseId: text('response_id').notNull().references(() => responses.id, { onDelete: 'cascade' }),
  pasteAttempts: integer('paste_attempts').default(0),
  qualityScore: real('quality_score').default(100),
  repeatedTextDetected: integer('repeated_text_detected', { mode: 'boolean' }).default(false),
  mostlyEnglish: integer('mostly_english', { mode: 'boolean' }).default(false),
  mostlyNumbers: integer('mostly_numbers', { mode: 'boolean' }).default(false),
  charRepetition: integer('char_repetition', { mode: 'boolean' }).default(false),
  flagged: integer('flagged', { mode: 'boolean' }).default(false),
  flagReason: text('flag_reason').default(''),
})

// ── Typing Metrics ────────────────────────────────────────────────────────────

export const typingMetrics = sqliteTable('typing_metrics', {
  id: text('id').primaryKey(),
  responseId: text('response_id').notNull().references(() => responses.id, { onDelete: 'cascade' }),
  totalDurationMs: integer('total_duration_ms').default(0),
  activeDurationMs: integer('active_duration_ms').default(0),
  idleDurationMs: integer('idle_duration_ms').default(0),
  wordsTyped: integer('words_typed').default(0),
  charsTyped: integer('chars_typed').default(0),
  typingSpeedWpm: real('typing_speed_wpm').default(0),
})

// ── Transliteration Overrides ───────────────────────────────────────────────────

export const transliterationOverrides = sqliteTable('transliteration_overrides', {
  id: text('id').primaryKey(),
  word: text('word').notNull().unique(), // lowercase romanized word
  override: text('override').notNull(), // Exact Marathi output
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

// ── Type exports ──────────────────────────────────────────────────────────────

export type Question = typeof questions.$inferSelect
export type NewQuestion = typeof questions.$inferInsert
export type Form = typeof forms.$inferSelect
export type NewForm = typeof forms.$inferInsert
export type FormQuestionRule = typeof formQuestionRules.$inferSelect
export type RespondentSession = typeof respondentSessions.$inferSelect
export type AssignedQuestionSet = typeof assignedQuestionSets.$inferSelect
export type Response = typeof responses.$inferSelect
export type ResponseQualityMetric = typeof responseQualityMetrics.$inferSelect
export type TypingMetric = typeof typingMetrics.$inferSelect
export type TransliterationOverride = typeof transliterationOverrides.$inferSelect
export type NewTransliterationOverride = typeof transliterationOverrides.$inferInsert
