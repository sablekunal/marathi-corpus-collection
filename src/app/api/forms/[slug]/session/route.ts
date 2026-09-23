export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  forms,
  respondentSessions,
} from '@/lib/db/schema'
import { eq, and, sql, count } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { assignQuestions, getAssignedQuestions } from '@/lib/randomAssignment'

// GET /api/forms/[slug]/session — init or retrieve session, get assigned questions
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const sessionId = req.headers.get('x-session-id') || req.nextUrl.searchParams.get('sessionId')

    // Get form by slug
    const [form] = await db.select().from(forms).where(eq(forms.slug, slug))
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    if (!form.isPublished) return NextResponse.json({ error: 'Form is not published' }, { status: 403 })
    if (form.isClosed) return NextResponse.json({ error: 'Form is closed' }, { status: 410 })

    // If session exists, return existing assignment
    if (sessionId) {
      const [session] = await db.select().from(respondentSessions).where(eq(respondentSessions.id, sessionId))
      if (session) {
        if (session.submittedAt) {
          return NextResponse.json({ error: 'Already submitted', alreadySubmitted: true }, { status: 200 })
        }
        const assignedQs = await getAssignedQuestions(sessionId)
        return NextResponse.json({ form, session, questions: assignedQs })
      }
    }

    // Check max responses
    if (form.maxResponses && form.maxResponses > 0) {
      const [{ value }] = await db
        .select({ value: count() })
        .from(respondentSessions)
        .where(and(eq(respondentSessions.formId, form.id), sql`submitted_at IS NOT NULL`))
      if (value >= form.maxResponses) {
        return NextResponse.json({ error: 'Form has reached maximum responses' }, { status: 410 })
      }
    }

    // Create new session
    const newSessionId = nanoid()
    const ua = req.headers.get('user-agent') || ''

    await db.insert(respondentSessions).values({
      id: newSessionId,
      formId: form.id,
      userAgent: ua,
      ipHash: '', // could hash req IP here for privacy
    })

    // Assign random questions
    const assignedQs = await assignQuestions(form.id, newSessionId)

    return NextResponse.json({ form, session: { id: newSessionId }, questions: assignedQs })
  } catch (err: unknown) {
    const error = err as Error
    console.error('[GET /api/forms/[slug]/session]', error)
    const isDbMissing = !process.env.DATABASE_URL
    const message = isDbMissing && process.env.NODE_ENV === 'production'
      ? 'Database not configured. Please set DATABASE_URL and DATABASE_AUTH_TOKEN in Vercel environment variables.'
      : (error?.message || 'Internal server error')
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
