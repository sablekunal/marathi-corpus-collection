import { db } from '../src/lib/db'
import { forms } from '../src/lib/db/schema'
import { assignQuestions } from '../src/lib/randomAssignment'

async function test() {
  try {
    const allForms = await db.select().from(forms)
    const formId = allForms[0].id
    console.log('Testing with form ID:', formId)
    const res = await assignQuestions(formId, 'test-session-123')
    console.log('Assigned questions:', res.length)
  } catch (err) {
    console.error('Error assigning questions:', err)
  }
}
test()
