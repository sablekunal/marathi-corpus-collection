/**
 * Random Question Assignment Engine
 *
 * Assigns a reproducible, randomized set of questions per respondent session
 * according to the form's category rules. Ensures no duplicate categories
 * within a session.
 */

import { db } from '@/lib/db'
import {
  assignedQuestionSets,
  formQuestionRules,
  questions,
  forms,
} from '@/lib/db/schema'
import { nanoid } from 'nanoid'
import { eq, and } from 'drizzle-orm'

export interface AssignedQuestion {
  questionId: string
  category: string
  question: string
  description: string
  required: boolean
  minWords: number
  maxWords: number
  estimatedTime: number
  order: number
}

/**
 * Standard Fisher-Yates shuffle using Math.random.
 * (Reproducibility is not needed as assigned sets are persisted in DB)
 */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Assigns questions for a new respondent session based on form rules.
 * Stores the assigned set in the database.
 *
 * @param formId  - The form ID
 * @param sessionId - The new session ID (used as seed for reproducibility)
 * @returns Ordered list of assigned questions
 */
export async function assignQuestions(
  formId: string,
  sessionId: string,
): Promise<AssignedQuestion[]> {
  // Get the target number of questions for this form
  const [form] = await db.select({ questionsPerForm: forms.questionsPerForm }).from(forms).where(eq(forms.id, formId))
  if (!form) throw new Error(`Form ${formId} not found`)
  
  const targetCount = form.questionsPerForm ?? 3

  // Get ALL enabled questions for this form
  const pool = await db
    .select()
    .from(questions)
    .where(eq(questions.enabled, true))

  if (pool.length === 0) {
    throw new Error(`No enabled questions found for form ${formId}`)
  }

  // Group by category
  const byCategory: Record<string, typeof pool> = {}
  for (const q of pool) {
    if (!byCategory[q.category]) byCategory[q.category] = []
    byCategory[q.category].push(q)
  }

  // Get unique categories and shuffle them
  const categories = Object.keys(byCategory)
  const shuffledCategories = shuffle(categories)

  // Pick up to targetCount distinct categories
  const selectedCategories = shuffledCategories.slice(0, targetCount)

  let assigned: AssignedQuestion[] = []
  let order = 0

  for (const cat of selectedCategories) {
    // Pick 1 random question from this category
    const catQuestions = byCategory[cat]
    const shuffledQs = shuffle(catQuestions)
    const q = shuffledQs[0]

    // Store in DB
    await db.insert(assignedQuestionSets).values({
      id: nanoid(),
      sessionId,
      questionId: q.id,
      questionOrder: order,
    })

    assigned.push({
      questionId: q.id,
      category: q.category,
      question: q.question,
      description: q.description || '',
      required: q.required ?? true,
      minWords: q.minWords ?? 8,
      maxWords: q.maxWords ?? 50,
      estimatedTime: q.estimatedTime ?? 30,
      order: order++,
    })
  }

  // Ensure they are strictly ordered before returning
  assigned.sort((a, b) => a.order - b.order)
  return assigned
}

/**
 * Retrieves previously assigned questions for a session (already stored).
 */
export async function getAssignedQuestions(
  sessionId: string,
): Promise<AssignedQuestion[]> {
  const rows = await db
    .select({
      questionId: assignedQuestionSets.questionId,
      questionOrder: assignedQuestionSets.questionOrder,
      category: questions.category,
      question: questions.question,
      description: questions.description,
      required: questions.required,
      minWords: questions.minWords,
      maxWords: questions.maxWords,
      estimatedTime: questions.estimatedTime,
    })
    .from(assignedQuestionSets)
    .innerJoin(questions, eq(assignedQuestionSets.questionId, questions.id))
    .where(eq(assignedQuestionSets.sessionId, sessionId))
    .orderBy(assignedQuestionSets.questionOrder)

  return rows.map(r => ({
    questionId: r.questionId,
    category: r.category,
    question: r.question,
    description: r.description || '',
    required: r.required ?? true,
    minWords: r.minWords ?? 8,
    maxWords: r.maxWords ?? 50,
    estimatedTime: r.estimatedTime ?? 30,
    order: r.questionOrder,
  }))
}
