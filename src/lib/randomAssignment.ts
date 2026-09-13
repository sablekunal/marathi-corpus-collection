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
 * Seeded pseudo-random shuffle using session ID as seed (reproducible).
 */
function seededShuffle<T>(arr: T[], seed: string): T[] {
  // Simple seeded LCG random
  let s = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const random = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
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

    // Seeded shuffle so same session always gets same questions
    const shuffled = seededShuffle(pool, `${sessionId}:${rule.category}`)
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
