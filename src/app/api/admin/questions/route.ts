import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { questions } from '@/lib/db/schema'
import { eq, and, desc, like, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const CATEGORIES = ['Opinion', 'Description', 'Experience', 'Imagination', 'Instruction', 'Dialogue', 'Regional', 'Comparison', 'Future'] as const

const QuestionSchema = z.object({
  category: z.enum(CATEGORIES),
  question: z.string().min(5),
  description: z.string().optional().default(''),
  required: z.boolean().optional().default(true),
  minWords: z.number().int().min(1).optional().default(8),
  maxWords: z.number().int().min(1).optional().default(50),
  language: z.string().optional().default('marathi'),
  enabled: z.boolean().optional().default(true),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('easy'),
  estimatedTime: z.number().int().optional().default(30),
  tags: z.array(z.string()).optional().default([]),
})

// GET /api/admin/questions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const enabled = searchParams.get('enabled')
    const search = searchParams.get('search')

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = (page - 1) * limit

    let query = db.select().from(questions).$dynamic()
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(questions).$dynamic()

    const conditions = []
    if (category) conditions.push(eq(questions.category, category))
    if (enabled !== null) conditions.push(eq(questions.enabled, enabled === 'true'))
    if (search) conditions.push(like(questions.question, `%${search}%`))

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
      countQuery = countQuery.where(and(...conditions))
    }

    const [totalResult, dataResult] = await Promise.all([
      countQuery,
      query.orderBy(desc(questions.createdAt)).limit(limit).offset(offset)
    ])

    const total = totalResult[0].count

    return NextResponse.json({
      data: dataResult,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (err) {
    console.error('[GET /api/admin/questions]', err)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

// POST /api/admin/questions — create single question
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = QuestionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const id = nanoid()

    await db.insert(questions).values({
      id,
      category: data.category,
      question: data.question,
      description: data.description,
      required: data.required,
      minWords: data.minWords,
      maxWords: data.maxWords,
      language: data.language,
      enabled: data.enabled,
      difficulty: data.difficulty,
      estimatedTime: data.estimatedTime,
      tags: JSON.stringify(data.tags),
    })

    const [created] = await db.select().from(questions).where(eq(questions.id, id))
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/questions]', err)
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}
