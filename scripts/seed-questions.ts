/**
 * Seed Questions from Claude's curated question bank.
 * Run: npm run db:seed-questions
 *
 * Idempotent: skips questions whose id already exists in the DB.
 */
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { questions } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
})
const db = drizzle(client)

interface QuestionImport {
  id: string
  category: string
  question: string
  description: string
  minWords: number
  maxWords: number
  difficulty: string
  estimatedTime: number
  tags: string[]
  enabled: boolean
}

async function seedQuestions() {
  console.log('📚 Seeding question bank...\n')

  // Read the question bank JSON
  const jsonPath = resolve(__dirname, '../Claude recommended files/files/questions-bulk-import.json')
  let data: { questions: QuestionImport[] }

  try {
    const raw = readFileSync(jsonPath, 'utf-8')
    data = JSON.parse(raw)
  } catch (err) {
    console.error('❌ Failed to read questions-bulk-import.json:', err)
    process.exit(1)
  }

  const questionsToImport = data.questions
  console.log(`Found ${questionsToImport.length} questions to import.\n`)

  let inserted = 0
  let skipped = 0

  for (const q of questionsToImport) {
    // Check if question with this id already exists
    const existing = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.id, q.id))

    if (existing.length > 0) {
      console.log(`  ⏭️  Skipped (exists): ${q.id}`)
      skipped++
      continue
    }

    // Capitalize category to match existing convention
    const capitalizedCategory = q.category.charAt(0).toUpperCase() + q.category.slice(1)

    await db.insert(questions).values({
      id: q.id,
      category: capitalizedCategory,
      question: q.question,
      description: q.description || '',
      required: true,
      minWords: q.minWords,
      maxWords: q.maxWords,
      language: 'marathi',
      enabled: q.enabled !== false,
      difficulty: q.difficulty || 'easy',
      estimatedTime: q.estimatedTime || 30,
      tags: JSON.stringify(q.tags || []),
    })

    console.log(`  ✅ Inserted: ${q.id} [${capitalizedCategory}]`)
    inserted++
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ Inserted: ${inserted}`)
  console.log(`⏭️  Skipped:  ${skipped}`)
  console.log(`📊 Total:    ${questionsToImport.length}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
}

seedQuestions()
  .then(() => {
    console.log('🎉 Question seeding complete!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ Question seeding failed:', err)
    process.exit(1)
  })
