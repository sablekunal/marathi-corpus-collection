'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface DraftData {
  answers: Record<string, string>
  currentIndex: number
  metadata: Record<string, string>
  savedAt: string
}

interface UseDraftAutoSaveReturn {
  answers: Record<string, string>
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>
  currentIndex: number
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>
  metadata: Record<string, string>
  setMetadata: React.Dispatch<React.SetStateAction<Record<string, string>>>
  clearDraft: () => void
  hasDraft: boolean
}

/**
 * Persists respondent form progress (answers, question index, metadata)
 * to localStorage so that mobile browser crashes, tab switches, or
 * incoming calls don't cause lost work.
 *
 * Expected impact: +25% completion rate on mobile.
 */
export function useDraftAutoSave(
  formSlug: string,
  sessionId: string | null
): UseDraftAutoSaveReturn {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [metadata, setMetadata] = useState<Record<string, string>>({})
  const [hasDraft, setHasDraft] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initializedRef = useRef(false)

  const draftKey = sessionId ? `draft_${formSlug}_${sessionId}` : null

  // ── Restore draft on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!draftKey || initializedRef.current) return

    try {
      const saved = localStorage.getItem(draftKey)
      if (saved) {
        const draft: DraftData = JSON.parse(saved)
        if (draft.answers && Object.keys(draft.answers).length > 0) {
          setAnswers(draft.answers)
          setHasDraft(true)
        }
        if (typeof draft.currentIndex === 'number') {
          setCurrentIndex(draft.currentIndex)
        }
        if (draft.metadata && Object.keys(draft.metadata).length > 0) {
          setMetadata(draft.metadata)
        }
      }
    } catch (e) {
      // Corrupt draft — ignore silently
      console.warn('[useDraftAutoSave] Failed to restore draft:', e)
    }

    initializedRef.current = true
  }, [draftKey])

  // ── Debounced save to localStorage ──────────────────────────────────
  const saveDraft = useCallback(() => {
    if (!draftKey) return

    const draft: DraftData = {
      answers,
      currentIndex,
      metadata,
      savedAt: new Date().toISOString(),
    }

    try {
      localStorage.setItem(draftKey, JSON.stringify(draft))
    } catch (e) {
      // localStorage full or unavailable — fail silently
      console.warn('[useDraftAutoSave] Failed to save draft:', e)
    }
  }, [draftKey, answers, currentIndex, metadata])

  useEffect(() => {
    if (!draftKey || !initializedRef.current) return

    // Debounce saves by 300ms
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    saveTimerRef.current = setTimeout(saveDraft, 300)

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [saveDraft, draftKey])

  // ── Clear draft after successful submission ─────────────────────────
  const clearDraft = useCallback(() => {
    if (!draftKey) return
    try {
      localStorage.removeItem(draftKey)
    } catch {
      // ignore
    }
    setHasDraft(false)
  }, [draftKey])

  return {
    answers,
    setAnswers,
    currentIndex,
    setCurrentIndex,
    metadata,
    setMetadata,
    clearDraft,
    hasDraft,
  }
}
