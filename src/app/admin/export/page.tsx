'use client'
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Download,
  FileSpreadsheet,
  FileCode,
  Layers,
  Database,
  Filter,
} from 'lucide-react'

export default function ExportAdminPage() {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [forms, setForms] = useState<{id: string, title: string}[]>([])
  const [selectedForm, setSelectedForm] = useState<string>('all')
  const [minQuality, setMinQuality] = useState<string>('0')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  useEffect(() => {
    fetch('/api/admin/forms')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setForms(data)
      })
      .catch(console.error)
  }, [])

  const handleDownload = (format: 'csv' | 'json' | 'jsonl') => {
    setDownloading(format)
    const params = new URLSearchParams()
    params.append('format', format)
    if (selectedForm && selectedForm !== 'all') params.append('formId', selectedForm)
    if (minQuality && Number(minQuality) > 0) params.append('minQuality', minQuality)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    window.open(`/api/admin/export?${params.toString()}`, '_blank')
    setTimeout(() => setDownloading(null), 2000)
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[oklch(0.20_0.04_250)]">
          Dataset Export &amp; Pipeline
        </h1>
        <p className="text-sm text-[oklch(0.52_0.04_250)] mt-0.5">
          Download formatted Marathi corpus data for LLM training, fine-tuning, and linguistic research
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[oklch(0.88_0.02_250)] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Export Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600">Form / Campaign</Label>
            <Select value={selectedForm} onValueChange={(val: string | null) => val && setSelectedForm(val)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Forms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Forms</SelectItem>
                {forms.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600">Start Date</Label>
            <Input type="date" className="h-9 text-xs" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600">End Date</Label>
            <Input type="date" className="h-9 text-xs" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600">Min Quality Score</Label>
            <Input type="number" min="0" max="100" className="h-9 text-xs" value={minQuality} onChange={e => setMinQuality(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Format cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CSV Format */}
        <div className="bg-white rounded-2xl border border-[oklch(0.88_0.02_250)] p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">CSV Export</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tabular format with UTF-8 encoding. Compatible with Excel, Pandas, R, and statistical suites.
              </p>
            </div>
          </div>
          <Button
            onClick={() => handleDownload('csv')}
            disabled={downloading === 'csv'}
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10"
          >
            <Download className="w-4 h-4" />
            Download .CSV
          </Button>
        </div>

        {/* JSONL Format (HuggingFace standard) */}
        <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 shadow-md flex flex-col justify-between space-y-4 relative">
          <span className="absolute -top-2.5 right-4 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Recommended for AI
          </span>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">JSONL (HuggingFace)</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Newline-delimited JSON. Direct streaming support for PyTorch, Hugging Face Datasets, and LLaMA fine-tuning.
              </p>
            </div>
          </div>
          <Button
            onClick={() => handleDownload('jsonl')}
            disabled={downloading === 'jsonl'}
            className="w-full gap-2 bg-[oklch(0.42_0.16_250)] hover:bg-[oklch(0.35_0.14_250)] text-white text-xs h-10 shadow-xs"
          >
            <Download className="w-4 h-4" />
            Download .JSONL
          </Button>
        </div>

        {/* Standard JSON */}
        <div className="bg-white rounded-2xl border border-[oklch(0.88_0.02_250)] p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Structured JSON</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Full relational structure with embedded metadata, typing metrics, and quality scores.
              </p>
            </div>
          </div>
          <Button
            onClick={() => handleDownload('json')}
            disabled={downloading === 'json'}
            className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white text-xs h-10"
          >
            <Download className="w-4 h-4" />
            Download .JSON
          </Button>
        </div>
      </div>

      {/* Dataset Schema Reference for Researchers */}
      <div className="bg-white rounded-2xl border border-[oklch(0.88_0.02_250)] p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Database className="w-4 h-4 text-blue-600" />
          <span>Dataset Attributes &amp; Field Specification</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <div className="font-mono font-bold text-slate-800">response_text</div>
            <div className="text-slate-500">The raw Marathi Devanagari text written by the respondent.</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <div className="font-mono font-bold text-slate-800">category</div>
            <div className="text-slate-500">Prompt taxonomy (Opinion, Experience, Description, etc.).</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <div className="font-mono font-bold text-slate-800">quality_score &amp; flagged</div>
            <div className="text-slate-500">Algorithmic quality check (0–100) and repetition/language flag.</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <div className="font-mono font-bold text-slate-800">typing_speed_wpm &amp; paste_attempts</div>
            <div className="text-slate-500">Typing metrics and anti-bot copy-paste prevention signals.</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <div className="font-mono font-bold text-slate-800">metadata.district &amp; dialect</div>
            <div className="text-slate-500">Geographic and dialectal regional metadata of the speaker.</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <div className="font-mono font-bold text-slate-800">session_id &amp; submitted_at</div>
            <div className="text-slate-500">Anonymized session identifier and UTC timestamp.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
