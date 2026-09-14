import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { transliterationOverrides } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function GET() {
  try {
    const data = await db
      .select()
      .from(transliterationOverrides)
      .orderBy(desc(transliterationOverrides.createdAt))
    return NextResponse.json(data)
  } catch (err) {
    console.error('[GET /api/admin/dictionary]', err)
    return NextResponse.json({ error: 'Failed to fetch dictionary overrides' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { word, override } = body

    if (!word || !override) {
      return NextResponse.json({ error: 'Word and override are required' }, { status: 400 })
    }

    const cleanWord = word.trim().toLowerCase()
    
    // Check for existing
    const existing = await db
      .select()
      .from(transliterationOverrides)
      .where(eq(transliterationOverrides.word, cleanWord))

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Override for this word already exists' }, { status: 400 })
    }

    const id = nanoid()
    await db.insert(transliterationOverrides).values({
      id,
      word: cleanWord,
      override: override.trim(),
    })

    const [created] = await db
      .select()
      .from(transliterationOverrides)
      .where(eq(transliterationOverrides.id, id))

    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/dictionary]', err)
    return NextResponse.json({ error: 'Failed to create override' }, { status: 500 })
  }
}
