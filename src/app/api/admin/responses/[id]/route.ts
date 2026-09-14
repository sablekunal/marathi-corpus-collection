import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { responses, responseQualityMetrics } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const UpdateResponseSchema = z.object({
  responseText: z.string().optional(),
  qualityScore: z.number().min(0).max(100).optional(),
  flagged: z.boolean().optional(),
  flagReason: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = UpdateResponseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    if (data.responseText !== undefined) {
      await db.update(responses)
        .set({ responseText: data.responseText })
        .where(eq(responses.id, id))
    }

    if (data.qualityScore !== undefined || data.flagged !== undefined || data.flagReason !== undefined) {
      const updates: any = {}
      if (data.qualityScore !== undefined) updates.qualityScore = data.qualityScore
      if (data.flagged !== undefined) updates.flagged = data.flagged
      if (data.flagReason !== undefined) updates.flagReason = data.flagReason
      
      await db.update(responseQualityMetrics)
        .set(updates)
        .where(eq(responseQualityMetrics.responseId, id))
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/admin/responses/[id]]', err)
    return NextResponse.json({ error: 'Failed to update response' }, { status: 500 })
  }
}
