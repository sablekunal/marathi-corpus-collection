export const dynamic = 'force-dynamic';
import Link from 'next/link'
import { ArrowLeft, Target, Users, Globe, BarChart3 } from 'lucide-react'
import Image from 'next/image'
import { ShareButtons } from '@/components/ShareButtons'

interface StatsData {
  totalSubmissions: number
  totalResponses: number
  totalWords: number
  todayCount: number
  dialectCount: number
  districtCount: number
  dialectBreakdown: { name: string; count: number }[]
  districtBreakdown: { name: string; count: number }[]
  goal: number
  progressPercent: number
}

async function fetchStats(): Promise<StatsData> {
  // Use absolute URL for server-side fetch during SSR
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  try {
    const res = await fetch(`${baseUrl}/api/stats`, {
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Failed to fetch stats')
    return res.json()
  } catch {
    return {
      totalSubmissions: 0,
      totalResponses: 0,
      totalWords: 0,
      todayCount: 0,
      dialectCount: 0,
      districtCount: 0,
      dialectBreakdown: [],
      districtBreakdown: [],
      goal: 500,
      progressPercent: 0,
    }
  }
}

export default async function StatsPage() {
  const stats = await fetchStats()
  const maxDialectCount = Math.max(...stats.dialectBreakdown.map(d => d.count), 1)

  return (
    <main className="min-h-screen bg-gradient-to-br from-[oklch(0.97_0.01_250)] via-white to-[oklch(0.93_0.03_250)]">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 bg-white rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </Link>
            <div>
              <h1 className="font-marathi text-2xl sm:text-3xl font-bold text-[oklch(0.20_0.04_250)]">
                मराठी संग्रह — आकडेवारी
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Marathi Corpus Collection — Live Statistics
              </p>
            </div>
          </div>
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm relative overflow-hidden border border-slate-100">
            <Image src="/logo.png" alt="Logo" fill className="object-contain p-1" />
          </div>
        </div>

        {/* ── Goal Progress ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[oklch(0.88_0.02_250)] p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
            <Target className="w-4 h-4 text-[oklch(0.42_0.16_250)]" />
            <span>लक्ष्य: ५०० प्रतिसाद (Goal: 500 Responses)</span>
          </div>
          <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden mb-2">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[oklch(0.42_0.16_250)] to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>{stats.totalSubmissions} of {stats.goal} responses</span>
            <span className="font-semibold text-[oklch(0.42_0.16_250)]">{stats.progressPercent}%</span>
          </div>
        </div>

        {/* ── KPI Cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon="📝" value={stats.totalSubmissions} label="Responses" />
          <StatCard icon="🗣️" value={stats.dialectCount} label="Dialects" />
          <StatCard icon="📍" value={stats.districtCount} label="Districts" />
          <StatCard
            icon="✍️"
            value={stats.totalWords > 1000 ? `${Math.round(stats.totalWords / 1000)}K` : String(stats.totalWords)}
            label="Words"
          />
        </div>

        {/* ── Today's Activity ─────────────────────────────────────── */}
        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-xl">🔥</span>
          <div>
            <span className="text-sm font-semibold text-emerald-900">
              आज {stats.todayCount} नवीन प्रतिसाद
            </span>
            <span className="text-xs text-emerald-700 block">
              {stats.todayCount} new responses today
            </span>
          </div>
        </div>

        {/* ── Dialect Distribution ──────────────────────────────────── */}
        {stats.dialectBreakdown.length > 0 && (
          <div className="bg-white rounded-2xl border border-[oklch(0.88_0.02_250)] p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-4">
              <Users className="w-4 h-4 text-[oklch(0.42_0.16_250)]" />
              <span>बोलीभाषा वितरण (Dialect Distribution)</span>
            </div>
            <div className="space-y-2.5">
              {stats.dialectBreakdown.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-36 sm:w-48 text-xs text-slate-700 font-medium truncate shrink-0">
                    {d.name}
                  </div>
                  <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[oklch(0.42_0.16_250)] rounded-full transition-all"
                      style={{ width: `${(d.count / maxDialectCount) * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-xs text-slate-600 font-semibold">
                    {d.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── District Coverage ─────────────────────────────────────── */}
        {stats.districtBreakdown.length > 0 && (
          <div className="bg-white rounded-2xl border border-[oklch(0.88_0.02_250)] p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-4">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>जिल्हा कव्हरेज (District Coverage)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.districtBreakdown.map((d) => (
                <span
                  key={d.name}
                  className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium"
                >
                  <span>{d.name}</span>
                  <span className="text-[oklch(0.42_0.16_250)] font-bold">{d.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Share CTA ────────────────────────────────────────────── */}
        <div className="bg-blue-50/80 border border-blue-200/60 rounded-2xl p-6 mb-6">
          <p className="text-sm font-semibold text-blue-900 mb-1 text-center">
            आम्हाला ५०० प्रतिसाद मिळवायला मदत करा!
          </p>
          <p className="text-xs text-blue-700 text-center mb-4">
            Help us reach 500 responses — share with friends and family on WhatsApp!
          </p>
          <div className="flex justify-center">
            <ShareButtons compact />
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[oklch(0.42_0.16_250)] hover:underline font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            मुख्य पानावर जा (Back to Home)
          </Link>
          <p className="text-[11px] text-slate-400">
            Last updated: {new Date().toLocaleDateString('en-IN')}
          </p>
        </div>
      </div>
    </main>
  )
}

function StatCard({ icon, value, label }: { icon: string; value: number | string; label: string }) {
  return (
    <div className="bg-white rounded-xl border border-[oklch(0.88_0.02_250)] p-4 text-center shadow-sm">
      <div className="text-2xl mb-1.5">{icon}</div>
      <div className="text-xl sm:text-2xl font-bold text-[oklch(0.20_0.04_250)]">{value}</div>
      <div className="text-[11px] text-slate-500 font-medium mt-0.5">{label}</div>
    </div>
  )
}
