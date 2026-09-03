import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { questions } from '@/lib/db/schema'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const CATEGORIES = ['Opinion', 'Description', 'Experience', 'Imagination', 'Instruction', 'Dialogue', 'Regional', 'Comparison', 'Future'] as const

const ImportItemSchema = z.object({
  category: z.enum(CATEGORIES),
  question: z.string().min(5),
  description: z.string().optional().default(''),
  required: z.boolean().optional().default(true),
  minWords: z.number().int().min(1).optional().default(50),
  maxWords: z.number().int().min(1).optional().default(250),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('easy'),
  estimatedTime: z.number().int().optional().default(60),
  tags: z.array(z.string()).optional().default([]),
})

const ImportSchema = z.array(ImportItemSchema).min(1).max(500)

// POST /api/admin/questions/import
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Parse and validate
    const parsed = ImportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: parsed.error.flatten(),
      }, { status: 400 })
    }

    const data = parsed.data

    // Insert all in bulk
    const toInsert = data.map(item => ({
      id: nanoid(),
      category: item.category,
      question: item.question,
      description: item.description,
      required: item.required,
      minWords: item.minWords,
      maxWords: item.maxWords,
      language: 'marathi',
      enabled: true,
      difficulty: item.difficulty,
      estimatedTime: item.estimatedTime,
      tags: JSON.stringify(item.tags),
    }))

    // Insert in batches of 50
    const BATCH = 50
    for (let i = 0; i < toInsert.length; i += BATCH) {
      await db.insert(questions).values(toInsert.slice(i, i + BATCH))
    }

    return NextResponse.json({
      imported: toInsert.length,
      message: `Successfully imported ${toInsert.length} question(s)`,
    }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/questions/import]', err)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
