import { db } from '@/lib/db'
import {
  questions,
  forms,
  respondentSessions,
  responses,
} from '@/lib/db/schema'
import { count, eq, sql } from 'drizzle-orm'
import { FileText, HelpCircle, MessageSquare, Users } from 'lucide-react'
import Link from 'next/link'

async function getDashboardStats() {
  const [qCount] = await db.select({ value: count() }).from(questions).where(eq(questions.enabled, true))
  const [fCount] = await db.select({ value: count() }).from(forms)
  const [sCount] = await db.select({ value: count() }).from(respondentSessions).where(sql`submitted_at IS NOT NULL`)
  const [rCount] = await db.select({ value: count() }).from(responses)

  return {
    questions: qCount?.value ?? 0,
    forms: fCount?.value ?? 0,
    sessions: sCount?.value ?? 0,
    responses: rCount?.value ?? 0,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      label: 'Active Questions',
      value: stats.questions,
      icon: HelpCircle,
      href: '/admin/questions',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Forms',
      value: stats.forms,
      icon: FileText,
      href: '/admin/forms',
      color: 'bg-violet-50 text-violet-600',
    },
    {
      label: 'Submissions',
      value: stats.sessions,
      icon: Users,
      href: '/admin/responses',
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Total Responses',
      value: stats.responses,
      icon: MessageSquare,
      href: '/admin/responses',
      color: 'bg-amber-50 text-amber-600',
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[oklch(0.20_0.04_250)]">Dashboard</h1>
        <p className="text-sm text-[oklch(0.52_0.04_250)] mt-1">
          Overview of your Marathi corpus collection activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <Link key={card.label} href={card.href} className="card-hover">
              <div className="bg-white rounded-xl border border-[oklch(0.88_0.02_250)] p-5 space-y-3">
                <div className={`inline-flex p-2 rounded-lg ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[oklch(0.20_0.04_250)]">
                    {card.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-[oklch(0.52_0.04_250)] mt-0.5">{card.label}</div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/questions?action=import"
          className="bg-[oklch(0.42_0.16_250)] text-white rounded-xl p-5 hover:bg-[oklch(0.35_0.14_250)] transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <div className="font-semibold">Import Questions</div>
          <div className="text-xs opacity-70 mt-1">Paste JSON to bulk-import questions</div>
        </Link>
        <Link
          href="/admin/forms?action=new"
          className="bg-white rounded-xl p-5 border border-[oklch(0.88_0.02_250)] hover:border-[oklch(0.63_0.12_250)] hover:shadow-md transition-all duration-200"
        >
          <div className="font-semibold text-[oklch(0.20_0.04_250)]">Create Form</div>
          <div className="text-xs text-[oklch(0.52_0.04_250)] mt-1">
            Configure a new collection form
          </div>
        </Link>
        <Link
          href="/admin/export"
          className="bg-white rounded-xl p-5 border border-[oklch(0.88_0.02_250)] hover:border-[oklch(0.63_0.12_250)] hover:shadow-md transition-all duration-200"
        >
          <div className="font-semibold text-[oklch(0.20_0.04_250)]">Export Dataset</div>
          <div className="text-xs text-[oklch(0.52_0.04_250)] mt-1">
            Download CSV / JSON / JSONL
          </div>
        </Link>
      </div>
    </div>
  )
}
