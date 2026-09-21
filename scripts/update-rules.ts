import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { forms, formQuestionRules } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env.local') })
dotenv.config({ path: resolve(__dirname, '../.env') })

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
})
const db = drizzle(client)

async function updateRules() {
  console.log('Fetching forms...')
  const allForms = await db.select().from(forms)
  
  if (allForms.length === 0) {
    console.log('No forms found.')
    return
  }

  const pilotForm = allForms.find(f => f.slug === 'marathi-pilot-2026') || allForms[0]
  console.log(`Updating rules for form: ${pilotForm.title} (slug: ${pilotForm.slug})`)

  // Delete existing rules for this form
  await db.delete(formQuestionRules).where(eq(formQuestionRules.formId, pilotForm.id))
  console.log('Deleted existing rules.')

  // Insert new rules
  const newCategories = ['Opinion', 'Experience', 'Descriptive', 'Cultural']
  for (const cat of newCategories) {
    await db.insert(formQuestionRules).values({
      id: nanoid(),
      formId: pilotForm.id,
      category: cat,
      count: 1 // 1 question from each category
    })
  }

  // Update questionsPerForm to 4 (since we have 4 categories)
  await db.update(forms).set({ questionsPerForm: 4 }).where(eq(forms.id, pilotForm.id))

  console.log('Successfully updated form question rules to use Opinion, Experience, Descriptive, Cultural categories.')
  process.exit(0)
}

updateRules().catch(err => {
  console.error(err)
  process.exit(1)
})
