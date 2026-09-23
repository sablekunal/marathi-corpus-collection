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
  // Get form's question rules (category → count)
  const rules = await db
    .select()
    .from(formQuestionRules)
    .where(eq(formQuestionRules.formId, formId))

  if (rules.length === 0) {
    throw new Error(`No question rules configured for form ${formId}`)
  }

  const assigned: AssignedQuestion[] = []
  let order = 0

  for (const rule of rules) {
    // Get all enabled questions in this category
    const pool = await db
      .select()
      .from(questions)
      .where(
        and(
          eq(questions.category, rule.category),
          eq(questions.enabled, true),
        ),
      )

    if (pool.length === 0) continue

    // Randomly shuffle the pool and take the required count
    const shuffled = shuffle(pool)
    const selected = shuffled.slice(0, rule.count ?? 1)

    for (const q of selected) {
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
  }

  // Sort by order
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
