'use client'
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Eye,
  Loader2,
  AlertTriangle,
  Search,
  ShieldAlert,
  Clock,
  Zap,
  Edit2,
  Save,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface ResponseItem {
  responseId: string
  sessionId: string
  category: string
  questionText: string
  responseText: string
  wordCount: number
  charCount: number
  submittedAt: string
  qualityScore: number
  pasteAttempts: number
  flagged: boolean
  flagReason: string
  typingSpeedWpm: number
  activeDurationMs: number
  metadata: Record<string, string>
}

export default function ResponsesAdminPage() {
  const [data, setData] = useState<ResponseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [selectedResponse, setSelectedResponse] = useState<ResponseItem | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    responseText: '',
    qualityScore: 100,
    flagged: false,
    flagReason: '',
  })
  const [saving, setSaving] = useState(false)

  const handleEditStart = (r: ResponseItem) => {
    setEditForm({
      responseText: r.responseText,
      qualityScore: r.qualityScore,
      flagged: r.flagged,
      flagReason: r.flagReason,
    })
    setIsEditing(true)
  }

  const handleEditSave = async () => {
    if (!selectedResponse) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/responses/${selectedResponse.responseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        const updated = {
          ...selectedResponse,
          responseText: editForm.responseText,
          qualityScore: editForm.qualityScore,
          flagged: editForm.flagged,
          flagReason: editForm.flagReason,
          wordCount: editForm.responseText.trim().split(/\s+/).filter(Boolean).length,
          charCount: editForm.responseText.length,
        }
        setSelectedResponse(updated)
        setData(prev => prev.map(item => item.responseId === updated.responseId ? updated : item))
        setIsEditing(false)
      }
    } catch (err) {
      console.error('Failed to save edit', err)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    let ignore = false
    setLoading(true)
    fetch(`/api/admin/responses?page=${page}&limit=20&query=${encodeURIComponent(debouncedSearch)}`)
      .then(res => res.json())
      .then(json => {
        if (!ignore && json.data) {
          setData(json.data)
          setTotalPages(json.totalPages || 1)
          setTotalRecords(json.total || 0)
          setLoading(false)
        }
      })
      .catch(err => {
        console.error(err)
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [page, debouncedSearch])

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[oklch(0.20_0.04_250)]">
          Responses &amp; Corpus Review
        </h1>
        <p className="text-sm text-[oklch(0.52_0.04_250)] mt-0.5">
          Inspect collected Marathi responses, quality flags, and typing metrics
        </p>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-[oklch(0.88_0.02_250)] shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search responses by keyword, category, or district..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 border-none text-sm h-10 w-full"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Total: {totalRecords} responses
        </div>
      </div>

      {/* Responses Table */}
      <div className="bg-white rounded-xl border border-[oklch(0.88_0.02_250)] overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="w-24 text-xs font-bold text-slate-600">Category</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Marathi Text Preview</TableHead>
              <TableHead className="w-24 text-xs font-bold text-slate-600 text-center">Words</TableHead>
              <TableHead className="w-24 text-xs font-bold text-slate-600 text-center">Quality</TableHead>
              <TableHead className="w-24 text-xs font-bold text-slate-600 text-center">Pastes</TableHead>
              <TableHead className="w-28 text-xs font-bold text-slate-600 text-center">District</TableHead>
              <TableHead className="w-20 text-xs font-bold text-slate-600 text-right">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                  Loading response submissions...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400 text-sm font-medium">
                  No responses recorded yet. Share a form link to begin collecting data.
                </TableCell>
              </TableRow>
            ) : (
              data.map(r => (
                <TableRow key={r.responseId} className="hover:bg-slate-50/50">
                  <TableCell>
                    <Badge variant="outline" className="text-[11px] bg-blue-50/50 text-blue-700 border-blue-200">
                      {r.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-marathi text-sm text-slate-800 line-clamp-2 max-w-lg leading-relaxed">
                      {r.responseText}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-xs text-slate-700">
                    {r.wordCount}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        r.qualityScore >= 80
                          ? 'bg-emerald-50 text-emerald-700'
                          : r.qualityScore >= 50
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {r.qualityScore}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {r.pasteAttempts > 0 ? (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center justify-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        {r.pasteAttempts}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-xs font-medium text-slate-600 font-marathi">
                    {r.metadata.district || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedResponse(r)}
                      className="h-8 w-8 text-slate-500 hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[oklch(0.88_0.02_250)] shadow-xs">
        <div className="text-sm text-slate-500">
          Showing page {page} of {totalPages} ({totalRecords} total responses)
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            Next
          </Button>
        </div>
      </div>

      {/* Response Detail Dialog */}
      {selectedResponse && (
        <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
          <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto space-y-4">
            <DialogHeader>
              <div className="flex items-center justify-between pr-8">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    {selectedResponse.category}
                  </Badge>
                  <DialogTitle className="text-base font-semibold">
                    Response Audit Detail
                  </DialogTitle>
                </div>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => handleEditStart(selectedResponse)} className="h-8 gap-1.5 text-xs">
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={saving} className="h-8 gap-1.5 text-xs text-slate-500 hover:text-slate-700">
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </Button>
                    <Button variant="default" size="sm" onClick={handleEditSave} disabled={saving} className="h-8 gap-1.5 text-xs bg-[oklch(0.42_0.16_250)] text-white">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save
                    </Button>
                  </div>
                )}
              </div>
              <DialogDescription className="text-xs">
                Submission ID: {selectedResponse.responseId}
              </DialogDescription>
            </DialogHeader>

            {/* Prompt */}
            <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Question Prompt</span>
              <p className="font-marathi font-bold text-slate-900 text-base">
                {selectedResponse.questionText}
              </p>
            </div>

            {/* Response Text */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                Respondent Marathi Text ({selectedResponse.wordCount} words)
              </span>
              {isEditing ? (
                <Textarea
                  value={editForm.responseText}
                  onChange={e => setEditForm({ ...editForm, responseText: e.target.value })}
                  className="min-h-[120px] font-marathi text-lg leading-loose text-slate-900 border-slate-300"
                />
              ) : (
                <div className="p-4 bg-white border border-slate-200 rounded-xl font-marathi text-lg leading-loose text-slate-900 shadow-inner">
                  {selectedResponse.responseText}
                </div>
              )}
            </div>

            {/* Quality Flags Edit Mode */}
            {isEditing && (
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Manual Quality Score</Label>
                  <Input 
                    type="number" 
                    min={0} 
                    max={100} 
                    value={editForm.qualityScore}
                    onChange={e => setEditForm({ ...editForm, qualityScore: Number(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between pt-1">
                    <Label className="text-xs font-semibold text-slate-600">Flag Response</Label>
                    <Switch
                      checked={editForm.flagged}
                      onCheckedChange={v => setEditForm({ ...editForm, flagged: v })}
                    />
                  </div>
                  {editForm.flagged && (
                    <Input
                      placeholder="Reason for flag..."
                      value={editForm.flagReason}
                      onChange={e => setEditForm({ ...editForm, flagReason: e.target.value })}
                      className="h-8 text-xs border-rose-200 focus-visible:ring-rose-500"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Quality Flags View Mode */}
            {!isEditing && selectedResponse.flagged && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center gap-2 text-xs text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Flag Reason: {selectedResponse.flagReason || 'Quality check alert'}</span>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <div>
                <div className="text-xs text-slate-500">Quality Score</div>
                <div className="text-base font-bold text-slate-800">{selectedResponse.qualityScore}%</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Typing Speed</div>
                <div className="text-base font-bold text-blue-700 flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  {selectedResponse.typingSpeedWpm} WPM
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Active Duration</div>
                <div className="text-base font-bold text-slate-800 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.round(selectedResponse.activeDurationMs / 1000)}s
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Paste Attempts</div>
                <div className="text-base font-bold text-amber-700">{selectedResponse.pasteAttempts}</div>
              </div>
            </div>

            {/* Demographics / Metadata */}
            {Object.keys(selectedResponse.metadata).length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Demographics Profile</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {Object.entries(selectedResponse.metadata).map(([k, v]) => (
                    <div key={k} className="p-2 bg-slate-50 border border-slate-100 rounded-md">
                      <span className="text-slate-400 capitalize">{k}: </span>
                      <span className="font-semibold text-slate-700 font-marathi">{String(v || '—')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
