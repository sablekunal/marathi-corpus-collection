export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import {
  questions,
  forms,
  respondentSessions,
  responses,
} from '@/lib/db/schema'
import { count, eq, sql, desc } from 'drizzle-orm'
import {
  FileText,
  HelpCircle,
  MessageSquare,
  Users,
  BarChart3,
  BookType,
  Download,
  ArrowRight,
  Inbox,
} from 'lucide-react'
import Link from 'next/link'

interface RecentItem {
  id: string
  questionText: string | null
  responseText: string
  wordCount: number | null
  submittedAt: string | null
  metadata: string | null
}

async function getDashboardData() {
  try {
    const [qCount] = await db
      .select({ value: count() })
      .from(questions)
      .where(eq(questions.enabled, true))

    const [fCount] = await db.select({ value: count() }).from(forms)

    const [sCount] = await db
      .select({ value: count() })
      .from(respondentSessions)
      .where(sql`submitted_at IS NOT NULL`)

    const [rCount] = await db.select({ value: count() }).from(responses)

    const recentList = await db
      .select({
        id: responses.id,
        questionText: questions.question,
        responseText: responses.responseText,
        wordCount: responses.wordCount,
        submittedAt: responses.submittedAt,
        metadata: respondentSessions.metadata,
      })
      .from(responses)
      .leftJoin(questions, eq(responses.questionId, questions.id))
      .leftJoin(respondentSessions, eq(responses.sessionId, respondentSessions.id))
      .orderBy(desc(responses.submittedAt))
      .limit(6)

    return {
      stats: {
        questions: qCount?.value ?? 0,
        forms: fCount?.value ?? 0,
        sessions: sCount?.value ?? 0,
        responses: rCount?.value ?? 0,
      },
      recent: recentList as RecentItem[],
    }
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error)
    return {
      stats: { questions: 0, forms: 0, sessions: 0, responses: 0 },
      recent: [],
    }
  }
}

export default async function AdminDashboardPage() {
  const { stats, recent } = await getDashboardData()

  const statCards = [
    {
      label: 'सक्रिय प्रश्न (Questions)',
      value: stats.questions,
      icon: HelpCircle,
      href: '/admin/questions',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      label: 'सक्रिय फॉर्म्स (Forms)',
      value: stats.forms,
      icon: FileText,
      href: '/admin/forms',
      color: 'bg-violet-50 text-violet-600 border-violet-100',
    },
    {
      label: 'पूर्ण सत्रे (Submissions)',
      value: stats.sessions,
      icon: Users,
      href: '/admin/responses',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      label: 'एकूण उत्तरे (Responses)',
      value: stats.responses,
      icon: MessageSquare,
      href: '/admin/responses',
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
  ]

  const quickNav = [
    {
      href: '/admin/responses',
      label: 'उत्तरे (Responses)',
      desc: 'सर्व प्रतिसाद व गुणवत्ता तपासा',
      icon: MessageSquare,
    },
    {
      href: '/admin/questions',
      label: 'प्रश्न व्यवस्थापन (Questions)',
      desc: 'नवीन प्रश्न तयार किंवा संपादन करा',
      icon: HelpCircle,
    },
    {
      href: '/admin/forms',
      label: 'फॉर्म्स (Forms)',
      desc: 'संकलन फॉर्म्स व्यवस्थापित करा',
      icon: FileText,
    },
    {
      href: '/admin/analytics',
      label: 'विश्लेषण (Analytics)',
      desc: 'तपशीलवार आलेख व आकडेवारी',
      icon: BarChart3,
    },
    {
      href: '/admin/dictionary',
      label: 'शब्दकोश (Dictionary)',
      desc: 'लिप्यंतरण अपवाद व दुरुस्ती',
      icon: BookType,
    },
    {
      href: '/admin/export',
      label: 'डेटा निर्यात (Export)',
      desc: 'CSV / JSON / JSONL डाउनलोड',
      icon: Download,
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-[#FDFDFC] min-h-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-marathi">
            प्रशासक नियंत्रण कक्ष{' '}
            <span className="text-slate-500 font-normal text-sm sm:text-base">
              (Admin Dashboard)
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            मराठी भाषा संग्रह • रिअल-टाइम संकलन आकडेवारी
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-medium text-emerald-800">डेटाबेस थेट जोडणी (Live DB)</span>
        </div>
      </div>

      {/* Real Live Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-orange-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span className={`p-2 rounded-lg border ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {card.value.toLocaleString()}
                </span>
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-600 font-marathi mt-3">
                {card.label}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Access Sections */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">द्रुत प्रवेश (Quick Access)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickNav.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-xs transition-all group"
              >
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-slate-900 group-hover:text-orange-600 transition-colors font-marathi">
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors mt-1" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* Real Recent Submissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm text-slate-900 font-marathi">
              नुकत्याच आलेल्या नोंदी (Recent Submissions)
            </h2>
            <p className="text-xs text-slate-500">डेटाबेसमधील थेट शेवटच्या नोंदी</p>
          </div>
          <Link
            href="/admin/responses"
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            सर्व नोंदी पहा →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <Inbox className="w-10 h-10 text-slate-300" />
            <p className="font-medium text-sm text-slate-700 font-marathi">
              अद्याप कोणत्याही नोंदी संकलित झालेल्या नाहीत.
            </p>
            <p className="text-xs text-slate-400">
              वापरकर्त्यांनी फॉर्म भरल्यानंतर येथे रिअल-टाइम नोंदी दिसतील.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium font-marathi">
                <tr>
                  <th className="px-4 py-3">प्रश्न (Question)</th>
                  <th className="px-4 py-3">उत्तर पूर्वावलोकन (Preview)</th>
                  <th className="px-4 py-3 text-center">शब्द संख्या</th>
                  <th className="px-4 py-3">जिल्हा / बोलीभाषा</th>
                  <th className="px-4 py-3 text-right">वेळ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((row) => {
                  let parsedMeta: { district?: string; dialect?: string } = {}
                  try {
                    if (row.metadata) parsedMeta = JSON.parse(row.metadata)
                  } catch {}

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-marathi text-slate-800 max-w-[200px] truncate">
                        {row.questionText || 'प्रश्न उपलब्ध नाही'}
                      </td>
                      <td className="px-4 py-3 font-marathi text-slate-600 max-w-[280px] truncate">
                        {row.responseText}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-700">
                        {row.wordCount ?? 0}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-marathi">
                        {parsedMeta.district || parsedMeta.dialect || '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400 text-xs">
                        {row.submittedAt ? new Date(row.submittedAt).toLocaleDateString('mr-IN') : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
