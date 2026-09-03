import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forms, formQuestionRules } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const UpdateFormSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  isPublished: z.boolean().optional(),
  isClosed: z.boolean().optional(),
  transliterationEnabled: z.boolean().optional(),
  antiPasteEnabled: z.boolean().optional(),
  commentsEnabled: z.boolean().optional(),
  maxResponses: z.number().int().min(0).optional(),
  metadataConfig: z.record(z.string(), z.unknown()).optional(),
  rules: z.array(z.object({
    category: z.string(),
    count: z.number().int().min(1),
  })).optional(),
})

// GET /api/admin/forms/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [form] = await db.select().from(forms).where(eq(forms.id, id))
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const rules = await db.select().from(formQuestionRules).where(eq(formQuestionRules.formId, id))
  return NextResponse.json({ ...form, rules })
}

// PATCH /api/admin/forms/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = UpdateFormSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() }

    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished
    if (data.isClosed !== undefined) updateData.isClosed = data.isClosed
    if (data.transliterationEnabled !== undefined) updateData.transliterationEnabled = data.transliterationEnabled
    if (data.antiPasteEnabled !== undefined) updateData.antiPasteEnabled = data.antiPasteEnabled
    if (data.commentsEnabled !== undefined) updateData.commentsEnabled = data.commentsEnabled
    if (data.maxResponses !== undefined) updateData.maxResponses = data.maxResponses
    if (data.metadataConfig !== undefined) updateData.metadataConfig = JSON.stringify(data.metadataConfig)

    await db.update(forms).set(updateData).where(eq(forms.id, id))

    // Update rules if provided
    if (data.rules) {
      await db.delete(formQuestionRules).where(eq(formQuestionRules.formId, id))
      if (data.rules.length > 0) {
        await db.insert(formQuestionRules).values(
          data.rules.map(r => ({ id: nanoid(), formId: id, category: r.category, count: r.count })),
        )
      }
    }

    const [updated] = await db.select().from(forms).where(eq(forms.id, id))
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PATCH /api/admin/forms/[id]]', err)
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 })
  }
}

// DELETE /api/admin/forms/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.delete(forms).where(eq(forms.id, id))
  return NextResponse.json({ success: true })
}
