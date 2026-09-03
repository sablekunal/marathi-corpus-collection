import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { questions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const UpdateSchema = z.object({
  category: z.string().optional(),
  question: z.string().min(5).optional(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  minWords: z.number().int().min(1).optional(),
  maxWords: z.number().int().min(1).optional(),
  enabled: z.boolean().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  estimatedTime: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
})

// PATCH /api/admin/questions/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = UpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }

    if (data.category !== undefined) updateData.category = data.category
    if (data.question !== undefined) updateData.question = data.question
    if (data.description !== undefined) updateData.description = data.description
    if (data.required !== undefined) updateData.required = data.required
    if (data.minWords !== undefined) updateData.minWords = data.minWords
    if (data.maxWords !== undefined) updateData.maxWords = data.maxWords
    if (data.enabled !== undefined) updateData.enabled = data.enabled
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty
    if (data.estimatedTime !== undefined) updateData.estimatedTime = data.estimatedTime
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags)

    await db.update(questions).set(updateData).where(eq(questions.id, id))
    const [updated] = await db.select().from(questions).where(eq(questions.id, id))

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PATCH /api/admin/questions/[id]]', err)
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
  }
}

// DELETE /api/admin/questions/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.delete(questions).where(eq(questions.id, id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/questions/[id]]', err)
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}
