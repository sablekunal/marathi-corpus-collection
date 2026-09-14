import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { transliterationOverrides } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    await db.delete(transliterationOverrides).where(eq(transliterationOverrides.id, id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/dictionary/[id]]', err)
    return NextResponse.json({ error: 'Failed to delete override' }, { status: 500 })
  }
}
