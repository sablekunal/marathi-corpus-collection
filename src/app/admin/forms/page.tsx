'use client'
export const dynamic = 'force-dynamic';

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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Plus,
  Copy,
  ExternalLink,
  Trash2,
  Edit,
  Loader2,
  Check,
  Sparkles,
} from 'lucide-react'

const CATEGORIES = [
  'Opinion',
  'Description',
  'Experience',
  'Imagination',
  'Instruction',
  'Dialogue',
  'Regional',
  'Comparison',
  'Future',
]

interface FormRule {
  category: string
  count: number
}

interface FormRecord {
  id: string
  title: string
  description: string
  slug: string
  isPublished: boolean
  isClosed: boolean
  transliterationEnabled: boolean
  antiPasteEnabled: boolean
  questionsPerForm: number
  maxResponses: number
  createdAt: string
  rules?: FormRule[]
}

export default function FormsAdminPage() {
  const [forms, setForms] = useState<FormRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  // Create/Edit modal state
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [transliterationEnabled, setTransliterationEnabled] = useState(true)
  const [antiPasteEnabled, setAntiPasteEnabled] = useState(true)
  const [isPublished, setIsPublished] = useState(true)
  const [rules, setRules] = useState<Record<string, number>>({
    Opinion: 1,
    Description: 1,
    Experience: 1,
  })

  const fetchForms = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/forms')
      const data = await res.json()
      if (Array.isArray(data)) setForms(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    fetch('/api/admin/forms')
      .then(res => res.json())
      .then(data => {
        if (!ignore && Array.isArray(data)) {
          setForms(data)
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
  }, [])

  const handleSlugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!editingId) {
      setSlug(handleSlugify(val))
    }
  }

  const handleRuleCountChange = (cat: string, count: number) => {
    setRules(prev => {
      const copy = { ...prev }
      if (count <= 0) {
        delete copy[cat]
      } else {
        copy[cat] = count
      }
      return copy
    })
  }

  const openCreateModal = () => {
    setEditingId(null)
    setTitle('')
    setDescription('')
    setSlug('')
    setTransliterationEnabled(true)
    setAntiPasteEnabled(true)
    setIsPublished(true)
    setRules({ Opinion: 1, Description: 1, Experience: 1 })
    setIsOpen(true)
  }

  const openEditModal = async (f: FormRecord) => {
    setEditingId(f.id)
    setTitle(f.title)
    setDescription(f.description || '')
    setSlug(f.slug)
    setTransliterationEnabled(f.transliterationEnabled)
    setAntiPasteEnabled(f.antiPasteEnabled)
    setIsPublished(f.isPublished)

    // Fetch rules for this form
    try {
      const res = await fetch(`/api/admin/forms/${f.id}`)
      const full = await res.json()
      if (full.rules && Array.isArray(full.rules)) {
        const ruleMap: Record<string, number> = {}
        full.rules.forEach((r: { category: string; count: number }) => {
          ruleMap[r.category] = r.count
        })
        setRules(ruleMap)
      }
    } catch (err) {
      console.error(err)
    }
    setIsOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const rulesArray = Object.entries(rules).map(([category, count]) => ({
      category,
      count,
    }))

    if (rulesArray.length === 0) {
      alert('Please configure at least one question rule category.')
      return
    }

    const payload = {
      title,
      description,
      slug,
      transliterationEnabled,
      antiPasteEnabled,
      isPublished,
      rules: rulesArray,
    }

    try {
      if (editingId) {
        await fetch(`/api/admin/forms/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch('/api/admin/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      setIsOpen(false)
      fetchForms()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return
    try {
      await fetch(`/api/admin/forms/${id}`, { method: 'DELETE' })
      fetchForms()
    } catch (err) {
      console.error(err)
    }
  }

  const copyShareLink = (formSlug: string) => {
    const url = `${window.location.origin}/f/${formSlug}`
    navigator.clipboard.writeText(url)
    setCopiedSlug(formSlug)
    setTimeout(() => setCopiedSlug(null), 2500)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[oklch(0.20_0.04_250)]">
            Form Management
          </h1>
          <p className="text-sm text-[oklch(0.52_0.04_250)] mt-0.5">
            Configure randomized question distribution and collection parameters
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="gap-2 text-xs h-10 bg-[oklch(0.42_0.16_250)] hover:bg-[oklch(0.35_0.14_250)] text-white shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create Form
        </Button>
      </div>

      {/* Forms Table */}
      <div className="bg-white rounded-xl border border-[oklch(0.88_0.02_250)] overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="text-xs font-bold text-slate-600">Form Title &amp; Slug</TableHead>
              <TableHead className="w-32 text-xs font-bold text-slate-600 text-center">Questions / Set</TableHead>
              <TableHead className="w-28 text-xs font-bold text-slate-600 text-center">Transliteration</TableHead>
              <TableHead className="w-28 text-xs font-bold text-slate-600 text-center">Anti-Paste</TableHead>
              <TableHead className="w-24 text-xs font-bold text-slate-600 text-center">Status</TableHead>
              <TableHead className="w-36 text-xs font-bold text-slate-600 text-right">Share &amp; Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                  Loading forms...
                </TableCell>
              </TableRow>
            ) : forms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-400 text-sm font-medium">
                  No forms created yet. Click &quot;Create Form&quot; to build one.
                </TableCell>
              </TableRow>
            ) : (
              forms.map(f => (
                <TableRow key={f.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="font-semibold text-slate-800 text-base">
                      {f.title}
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      /f/{f.slug}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold text-sm text-[oklch(0.42_0.16_250)] bg-blue-50 px-2.5 py-1 rounded-md">
                      {f.questionsPerForm} Qs
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={f.transliterationEnabled ? 'default' : 'secondary'} className="text-[10px]">
                      {f.transliterationEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={f.antiPasteEnabled ? 'default' : 'secondary'} className="text-[10px]">
                      {f.antiPasteEnabled ? 'Protected' : 'Off'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={`text-[10px] ${
                        f.isPublished
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {f.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyShareLink(f.slug)}
                        title="Copy Form URL"
                        className="h-8 w-8 text-slate-600"
                      >
                        {copiedSlug === f.slug ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <a
                        href={`/f/${f.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-600"
                        title="Open Form"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(f)}
                        className="h-8 w-8 text-slate-500 hover:text-blue-600"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(f.id)}
                        className="h-8 w-8 text-slate-500 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Form Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Form' : 'Create Corpus Collection Form'}</DialogTitle>
            <DialogDescription>
              Define form title, public URL, and random question allocation rules.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Form Title</Label>
              <Input
                required
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="उदा. मराठी भाषा संवाद सर्वेक्षण 2026"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Instructions displayed to respondents before starting..."
                className="text-xs min-h-[70px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">URL Slug</Label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-mono">/f/</span>
                <Input
                  required
                  value={slug}
                  onChange={e => setSlug(handleSlugify(e.target.value))}
                  placeholder="marathi-pilot-2026"
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* Question Randomization Rules */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Randomized Question Allocation Rules</span>
              </div>
              <p className="text-[11px] text-slate-500">
                When a respondent opens the form, the system randomly selects questions per category:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {CATEGORIES.map(cat => {
                  const count = rules[cat] || 0
                  return (
                    <div
                      key={cat}
                      className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between gap-1 transition-all ${
                        count > 0
                          ? 'bg-blue-50/60 border-blue-200 text-blue-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="font-semibold">{cat}</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <button
                          type="button"
                          onClick={() => handleRuleCountChange(cat, count - 1)}
                          className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 font-bold flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold">{count}</span>
                        <button
                          type="button"
                          onClick={() => handleRuleCountChange(cat, count + 1)}
                          className="w-6 h-6 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="text-right text-xs font-semibold text-blue-700 pt-1">
                Total Questions Assigned per Respondent:{' '}
                {Object.values(rules).reduce((a, b) => a + b, 0)}
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold">Marathi Transliteration</Label>
                  <p className="text-[11px] text-slate-400">
                    Allows users to type Roman &quot;namaste&quot; and converts to &quot;नमस्ते&quot;
                  </p>
                </div>
                <Switch
                  checked={transliterationEnabled}
                  onCheckedChange={setTransliterationEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold">Anti-Paste Protection</Label>
                  <p className="text-[11px] text-slate-400">
                    Disables paste/drag to prevent AI text dumps &amp; logs attempts
                  </p>
                </div>
                <Switch
                  checked={antiPasteEnabled}
                  onCheckedChange={setAntiPasteEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold">Published</Label>
                  <p className="text-[11px] text-slate-400">
                    Allow public respondents to access via URL
                  </p>
                </div>
                <Switch
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[oklch(0.42_0.16_250)] text-white">
                {editingId ? 'Save Changes' : 'Create Form'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
