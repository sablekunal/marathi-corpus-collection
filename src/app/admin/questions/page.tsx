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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Plus,
  FileUp,
  Search,
  Trash2,
  Edit,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

const CATEGORIES = [
  'All',
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

interface QuestionRecord {
  id: string
  category: string
  question: string
  description: string
  required: boolean
  minWords: number
  maxWords: number
  difficulty: string
  estimatedTime: number
  enabled: boolean
  createdAt: string
}

export default function QuestionsAdminPage() {
  const [questions, setQuestions] = useState<QuestionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Create / Edit modal state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    category: 'Opinion',
    question: '',
    description: '',
    minWords: 8,
    maxWords: 50,
    difficulty: 'easy',
    estimatedTime: 30,
    enabled: true,
  })

  // Import JSON modal state
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importJson, setImportJson] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== 'All') params.append('category', selectedCategory)
      if (search) params.append('search', search)

      const res = await fetch(`/api/admin/questions?${params.toString()}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setQuestions(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, search])

  useEffect(() => {
    let ignore = false
    const params = new URLSearchParams()
    if (selectedCategory !== 'All') params.append('category', selectedCategory)
    if (search) params.append('search', search)

    fetch(`/api/admin/questions?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (!ignore && Array.isArray(data)) {
          setQuestions(data)
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
  }, [selectedCategory, search])

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        // Update
        const res = await fetch(`/api/admin/questions/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (res.ok) {
          setIsFormOpen(false)
          fetchQuestions()
        }
      } else {
        // Create
        const res = await fetch('/api/admin/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (res.ok) {
          setIsFormOpen(false)
          fetchQuestions()
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
      if (res.ok) fetchQuestions()
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleEnabled = async (id: string, currentVal: boolean) => {
    try {
      await fetch(`/api/admin/questions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentVal }),
      })
      setQuestions(prev =>
        prev.map(q => (q.id === id ? { ...q, enabled: !currentVal } : q))
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleImportSubmit = async () => {
    setImportError(null)
    setImportSuccess(null)
    try {
      setImporting(true)
      const parsed = JSON.parse(importJson)
      if (!Array.isArray(parsed)) {
        setImportError('JSON must be an array of question objects.')
        setImporting(false)
        return
      }

      const res = await fetch('/api/admin/questions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      })

      const data = await res.json()
      if (!res.ok) {
        setImportError(data.error || 'Import failed')
      } else {
        setImportSuccess(`Successfully imported ${data.imported} questions!`)
        setTimeout(() => {
          setIsImportOpen(false)
          setImportJson('')
          fetchQuestions()
        }, 1500)
      }
    } catch {
      setImportError('Invalid JSON format. Please verify syntax.')
    } finally {
      setImporting(false)
    }
  }

  const openCreateModal = () => {
    setEditingId(null)
    setFormData({
      category: 'Opinion',
      question: '',
      description: '',
      minWords: 8,
      maxWords: 50,
      difficulty: 'easy',
      estimatedTime: 30,
      enabled: true,
    })
    setIsFormOpen(true)
  }

  const openEditModal = (q: QuestionRecord) => {
    setEditingId(q.id)
    setFormData({
      category: q.category,
      question: q.question,
      description: q.description || '',
      minWords: q.minWords,
      maxWords: q.maxWords,
      difficulty: q.difficulty || 'easy',
      estimatedTime: q.estimatedTime || 60,
      enabled: q.enabled,
    })
    setIsFormOpen(true)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[oklch(0.20_0.04_250)]">
            Question Bank
          </h1>
          <p className="text-sm text-[oklch(0.52_0.04_250)] mt-0.5">
            Manage, categorize, and bulk-import research prompts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsImportOpen(true)}
            className="gap-2 text-xs h-10 border-[oklch(0.88_0.02_250)]"
          >
            <FileUp className="w-4 h-4 text-slate-600" />
            Import JSON
          </Button>
          <Button
            onClick={openCreateModal}
            className="gap-2 text-xs h-10 bg-[oklch(0.42_0.16_250)] hover:bg-[oklch(0.35_0.14_250)] text-white shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-[oklch(0.88_0.02_250)] shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search questions by keyword..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 border-none text-sm h-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Category:</span>
          <Select
            value={selectedCategory}
            onValueChange={(val: string | null) => {
              if (val) setSelectedCategory(val)
            }}
          >
            <SelectTrigger className="w-full sm:w-44 bg-slate-50 border-none text-xs h-10">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c} className="text-xs">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Questions Data Table */}
      <div className="bg-white rounded-xl border border-[oklch(0.88_0.02_250)] overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="w-28 text-xs font-bold text-slate-600">Category</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Marathi Question</TableHead>
              <TableHead className="w-24 text-xs font-bold text-slate-600 text-center">Words</TableHead>
              <TableHead className="w-24 text-xs font-bold text-slate-600 text-center">Difficulty</TableHead>
              <TableHead className="w-24 text-xs font-bold text-slate-600 text-center">Status</TableHead>
              <TableHead className="w-28 text-xs font-bold text-slate-600 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                  Loading questions...
                </TableCell>
              </TableRow>
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-400 text-sm font-medium">
                  No questions found. Click &quot;Add Question&quot; or &quot;Import JSON&quot; to begin.
                </TableCell>
              </TableRow>
            ) : (
              questions.map(q => (
                <TableRow key={q.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <Badge variant="outline" className="text-[11px] font-semibold bg-blue-50/50 text-blue-700 border-blue-200">
                      {q.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-marathi font-semibold text-slate-800 text-base leading-snug">
                      {q.question}
                    </div>
                    {q.description && (
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {q.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-xs font-medium text-slate-600">
                    {q.minWords}–{q.maxWords}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-[11px] capitalize text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                      {q.difficulty}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => handleToggleEnabled(q.id, q.enabled)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                        q.enabled
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {q.enabled ? 'Active' : 'Disabled'}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(q)}
                        className="h-8 w-8 text-slate-500 hover:text-blue-600"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(q.id)}
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

      {/* Create / Edit Question Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Question' : 'Add New Question'}</DialogTitle>
            <DialogDescription>
              Enter Marathi question text and corpus constraints.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveQuestion} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(val: string | null) => {
                  if (val) setFormData(p => ({ ...p, category: val }))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Question Text (मराठी)</Label>
              <Textarea
                required
                value={formData.question}
                onChange={e => setFormData(p => ({ ...p, question: e.target.value }))}
                placeholder="उदा. ऑनलाइन शिक्षणाचे फायदे कोणते आहेत?"
                className="font-marathi text-base min-h-[90px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description / Guidance (Optional)</Label>
              <Input
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="उदा. किमान 3 मुद्द्यांचा समावेश करा."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Min Words</Label>
                <Input
                  type="number"
                  min={10}
                  value={formData.minWords}
                  onChange={e => setFormData(p => ({ ...p, minWords: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Max Words</Label>
                <Input
                  type="number"
                  min={50}
                  value={formData.maxWords}
                  onChange={e => setFormData(p => ({ ...p, maxWords: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(val: string | null) => {
                    if (val) setFormData(p => ({ ...p, difficulty: val }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-6">
                <Label className="text-xs font-semibold">Enabled</Label>
                <Switch
                  checked={formData.enabled}
                  onCheckedChange={v => setFormData(p => ({ ...p, enabled: v }))}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[oklch(0.42_0.16_250)] text-white">
                {editingId ? 'Save Changes' : 'Create Question'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* JSON Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-xl bg-white">
          <DialogHeader>
            <DialogTitle>Bulk JSON Import</DialogTitle>
            <DialogDescription>
              Paste JSON array of questions formatted with category, question, and minWords.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <Textarea
              value={importJson}
              onChange={e => setImportJson(e.target.value)}
              placeholder={`[
  {
    "category": "Opinion",
    "question": "ऑनलाइन शिक्षणाचे फायदे कोणते आहेत?",
    "minWords": 50,
    "maxWords": 250
  }
]`}
              className="font-mono text-xs min-h-[220px]"
            />

            {importError && (
              <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {importSuccess && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{importSuccess}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImportOpen(false)}
              disabled={importing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportSubmit}
              disabled={importing || !importJson.trim()}
              className="bg-[oklch(0.42_0.16_250)] text-white"
            >
              {importing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Validate &amp; Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
