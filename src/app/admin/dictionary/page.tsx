export const dynamic = 'force-dynamic';
'use client'

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
import { Input } from '@/components/ui/input'
import { Loader2, Trash2, Plus, BookType } from 'lucide-react'

interface Override {
  id: string
  word: string
  override: string
  createdAt: string
}

export default function DictionaryAdminPage() {
  const [overrides, setOverrides] = useState<Override[]>([])
  const [loading, setLoading] = useState(true)
  
  const [newWord, setNewWord] = useState('')
  const [newOverride, setNewOverride] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOverrides = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/dictionary')
      const data = await res.json()
      if (Array.isArray(data)) {
        setOverrides(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverrides()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWord || !newOverride) return
    setError(null)
    setAdding(true)

    try {
      const res = await fetch('/api/admin/dictionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: newWord, override: newOverride }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to add override')
        return
      }

      setNewWord('')
      setNewOverride('')
      fetchOverrides()
    } catch (err) {
      console.error(err)
      setError('Network error occurred.')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this override?')) return
    try {
      const res = await fetch(`/api/admin/dictionary/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setOverrides(prev => prev.filter(o => o.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[oklch(0.20_0.04_250)] flex items-center gap-2">
          <BookType className="w-6 h-6 text-blue-600" />
          Custom Transliteration Dictionary
        </h1>
        <p className="text-sm text-[oklch(0.52_0.04_250)] mt-1 max-w-2xl">
          Define exact phonetic overrides for words that automated engines get wrong (e.g. loanwords). 
          These rules bypass the AI transliteration engine and instantly apply your exact output.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Add New Override Form */}
        <div className="md:col-span-1">
          <form onSubmit={handleAdd} className="bg-white p-5 rounded-xl border border-[oklch(0.88_0.02_250)] shadow-xs space-y-4 sticky top-6">
            <h2 className="text-sm font-bold text-slate-800">Add New Override</h2>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">English / Roman Word</label>
              <Input
                placeholder="e.g. social"
                value={newWord}
                onChange={e => setNewWord(e.target.value)}
                className="bg-slate-50 border-slate-200 h-9"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Exact Marathi Output</label>
              <Input
                placeholder="e.g. सोशल"
                value={newOverride}
                onChange={e => setNewOverride(e.target.value)}
                className="bg-slate-50 border-slate-200 h-9 font-marathi text-sm"
              />
            </div>

            {error && (
              <div className="text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={adding || !newWord || !newOverride}
              className="w-full bg-[oklch(0.42_0.16_250)] hover:bg-[oklch(0.35_0.16_250)] text-white h-9"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
              Add Rule
            </Button>
          </form>
        </div>

        {/* Overrides Table */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-[oklch(0.88_0.02_250)] overflow-hidden shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="text-xs font-bold text-slate-600">Roman Word</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600">Marathi Override</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 text-right w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12 text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                      Loading dictionary...
                    </TableCell>
                  </TableRow>
                ) : overrides.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12 text-slate-400 text-sm font-medium">
                      No custom rules defined yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  overrides.map(o => (
                    <TableRow key={o.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-700">
                        {o.word}
                      </TableCell>
                      <TableCell className="font-marathi font-bold text-[oklch(0.42_0.16_250)] text-base">
                        {o.override}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(o.id)}
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>
    </div>
  )
}
