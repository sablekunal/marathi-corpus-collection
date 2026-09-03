import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forms, formQuestionRules } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const FormSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().default(''),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, hyphens'),
  transliterationEnabled: z.boolean().optional().default(true),
  antiPasteEnabled: z.boolean().optional().default(true),
  commentsEnabled: z.boolean().optional().default(false),
  maxResponses: z.number().int().min(0).optional().default(0),
  metadataConfig: z.record(z.string(), z.unknown()).optional().default({}),
  rules: z.array(z.object({
    category: z.string(),
    count: z.number().int().min(1).max(10),
  })).min(1),
})

// GET /api/admin/forms
export async function GET() {
  try {
    const rows = await db.select().from(forms).orderBy(desc(forms.createdAt))
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[GET /api/admin/forms]', err)
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 })
  }
}

// POST /api/admin/forms
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = FormSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const id = nanoid()

    await db.insert(forms).values({
      id,
      title: data.title,
      description: data.description,
      slug: data.slug,
      transliterationEnabled: data.transliterationEnabled,
      antiPasteEnabled: data.antiPasteEnabled,
      commentsEnabled: data.commentsEnabled,
      maxResponses: data.maxResponses,
      metadataConfig: JSON.stringify(data.metadataConfig),
      questionsPerForm: data.rules.reduce((acc, r) => acc + r.count, 0),
    })

    // Insert rules
    if (data.rules.length > 0) {
      await db.insert(formQuestionRules).values(
        data.rules.map(rule => ({
          id: nanoid(),
          formId: id,
          category: rule.category,
          count: rule.count,
        })),
      )
    }

    const [created] = await db.select().from(forms).where(eq(forms.id, id))
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/forms]', err)
    return NextResponse.json({ error: 'Failed to create form' }, { status: 500 })
  }
}
