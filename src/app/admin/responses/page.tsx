'use client'

import { useState, useEffect, useCallback } from 'react'
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
  CheckCircle2,
  Search,
  ShieldAlert,
  Clock,
  Zap,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

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
  const [selectedResponse, setSelectedResponse] = useState<ResponseItem | null>(null)

  const fetchResponses = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/export?format=json')
      const json = await res.json()
      if (Array.isArray(json)) {
        // Map export records
        const mapped: ResponseItem[] = json.map((r: Record<string, unknown>) => ({
          responseId: String(r.response_id || ''),
          sessionId: String(r.session_id || ''),
          category: String(r.category || ''),
          questionText: String(r.question_text || ''),
          responseText: String(r.response_text || ''),
          wordCount: Number(r.word_count || 0),
          charCount: Number(r.char_count || 0),
          submittedAt: String(r.submitted_at || ''),
          qualityScore: Number(r.quality_score || 100),
          pasteAttempts: Number(r.paste_attempts || 0),
          flagged: Boolean(r.flagged),
          flagReason: String(r.flag_reason || ''),
          typingSpeedWpm: Number(r.typing_speed_wpm || 0),
          activeDurationMs: Number(r.active_duration_ms || 0),
          metadata: (r.metadata as Record<string, string>) || {},
        }))
        setData(mapped)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResponses()
  }, [fetchResponses])

  const filtered = data.filter(
    item =>
      item.responseText.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.metadata.district && item.metadata.district.includes(search))
  )

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
          Total: {filtered.length} responses
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
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400 text-sm font-medium">
                  No responses recorded yet. Share a form link to begin collecting data.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(r => (
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

      {/* Response Detail Dialog */}
      {selectedResponse && (
        <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
          <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  {selectedResponse.category}
                </Badge>
                <DialogTitle className="text-base font-semibold">
                  Response Audit Detail
                </DialogTitle>
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
              <div className="p-4 bg-white border border-slate-200 rounded-xl font-marathi text-lg leading-loose text-slate-900 shadow-inner">
                {selectedResponse.responseText}
              </div>
            </div>

            {/* Quality Flags */}
            {selectedResponse.flagged && (
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
