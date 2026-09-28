import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
})

async function init() {
  console.log('Initializing SQLite database schema...')

  await client.execute(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      question TEXT NOT NULL,
      description TEXT DEFAULT '',
      required INTEGER DEFAULT 1,
      min_words INTEGER DEFAULT 8,
      max_words INTEGER DEFAULT 50,
      language TEXT DEFAULT 'marathi',
      enabled INTEGER DEFAULT 1,
      difficulty TEXT DEFAULT 'easy',
      estimated_time INTEGER DEFAULT 30,
      tags TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS forms (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      slug TEXT NOT NULL UNIQUE,
      is_published INTEGER DEFAULT 0,
      is_closed INTEGER DEFAULT 0,
      transliteration_enabled INTEGER DEFAULT 1,
      anti_paste_enabled INTEGER DEFAULT 1,
      metadata_config TEXT DEFAULT '{}',
      comments_enabled INTEGER DEFAULT 0,
      questions_per_form INTEGER DEFAULT 3,
      max_responses INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS form_question_rules (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      count INTEGER DEFAULT 1
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS respondent_sessions (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
      started_at TEXT DEFAULT (datetime('now')),
      submitted_at TEXT,
      user_agent TEXT DEFAULT '',
      ip_hash TEXT DEFAULT '',
      metadata TEXT DEFAULT '{}',
      paste_attempts INTEGER DEFAULT 0,
      consent_research INTEGER DEFAULT 0,
      consent_ai INTEGER DEFAULT 0,
      consent_timestamp TEXT DEFAULT (datetime('now'))
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS assigned_question_sets (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES respondent_sessions(id) ON DELETE CASCADE,
      question_id TEXT NOT NULL REFERENCES questions(id),
      question_order INTEGER NOT NULL,
      assigned_at TEXT DEFAULT (datetime('now'))
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES respondent_sessions(id) ON DELETE CASCADE,
      question_id TEXT NOT NULL REFERENCES questions(id),
      response_text TEXT NOT NULL,
      word_count INTEGER DEFAULT 0,
      char_count INTEGER DEFAULT 0,
      submitted_at TEXT DEFAULT (datetime('now'))
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS response_quality_metrics (
      id TEXT PRIMARY KEY,
      response_id TEXT NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
      paste_attempts INTEGER DEFAULT 0,
      quality_score REAL DEFAULT 100,
      repeated_text_detected INTEGER DEFAULT 0,
      mostly_english INTEGER DEFAULT 0,
      mostly_numbers INTEGER DEFAULT 0,
      char_repetition INTEGER DEFAULT 0,
      flagged INTEGER DEFAULT 0,
      flag_reason TEXT DEFAULT ''
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS typing_metrics (
      id TEXT PRIMARY KEY,
      response_id TEXT NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
      total_duration_ms INTEGER DEFAULT 0,
      active_duration_ms INTEGER DEFAULT 0,
      idle_duration_ms INTEGER DEFAULT 0,
      words_typed INTEGER DEFAULT 0,
      chars_typed INTEGER DEFAULT 0,
      typing_speed_wpm REAL DEFAULT 0
    );
  `)

  // Migrate existing databases if columns are missing
  try {
    await client.execute(`ALTER TABLE respondent_sessions ADD COLUMN consent_research INTEGER DEFAULT 0;`)
  } catch {}
  try {
    await client.execute(`ALTER TABLE respondent_sessions ADD COLUMN consent_ai INTEGER DEFAULT 0;`)
  } catch {}
  try {
    await client.execute(`ALTER TABLE respondent_sessions ADD COLUMN consent_timestamp TEXT DEFAULT '';`)
  } catch (e) {
    console.error('Migration error for consent_timestamp:', e)
  }

  console.log('Database tables verified/created successfully.')
}

init().catch(err => {
  console.error('Init error:', err)
  process.exit(1)
})
