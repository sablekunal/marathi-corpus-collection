import { config } from 'dotenv'
config({ path: '.env.local' })
import { db } from '../src/lib/db'
import { forms, questions } from '../src/lib/db/schema'

async function check() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL)
  console.log('AUTH_TOKEN_PREVIEW:', process.env.DATABASE_AUTH_TOKEN?.slice(0, 10))
  const allForms = await db.select().from(forms)
  console.log('Forms count:', allForms.length)
  const allQs = await db.select().from(questions)
  console.log('Questions count:', allQs.length)
}
check()
