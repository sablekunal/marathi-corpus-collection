import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { respondentSessions } from '../src/lib/db/schema'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env.local') })
dotenv.config({ path: resolve(__dirname, '../.env') })

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
})
const db = drizzle(client)

async function clearResponses() {
  console.log('🧹 Clearing all test responses from the database...')

  try {
    // Delete all sessions. Due to 'onDelete: cascade' in schema.ts,
    // this will automatically delete related data in:
    // - responses
    // - assigned_question_sets
    // - response_quality_metrics
    // - typing_metrics
    await db.delete(respondentSessions)
    
    console.log('✅ All respondent data, responses, and metrics have been successfully cleared.')
    console.log('The database is now clean and ready for public launch!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Failed to clear responses:', err)
    process.exit(1)
  }
}

clearResponses()
