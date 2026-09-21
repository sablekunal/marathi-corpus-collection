export const dynamic = 'force-dynamic';
'use client'

import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts'
import {
  Users,
  CheckCircle,
  FileText,
  ShieldAlert,
  Loader2,
  Languages,
  Zap,
  ShieldCheck,
} from 'lucide-react'



interface AnalyticsData {
  totalSubmissions: number
  totalStarted: number
  totalResponses: number
  completionRate: number
  avgWordCount: number
  avgQualityScore: number
  flaggedCount: number
  totalPasteAttempts: number
  categoryDistribution: { category: string; count: number }[]
  dailyTrend: { date: string; count: number }[]
  transliterationMetrics?: {
    totalAttempts: number
    cacheHits: number
    googleHits: number
    fallbackHits: number
    avgLatencyMs: number
    cacheHitRate: number
    googleHitRate: number
    fallbackHitRate: number
    successRate: number
  }
}

export default function AnalyticsAdminPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/analytics')
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[oklch(0.42_0.16_250)]" />
        <p className="text-sm font-medium">Loading research analytics...</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[oklch(0.20_0.04_250)]">
          Corpus Research Analytics
        </h1>
        <p className="text-sm text-[oklch(0.52_0.04_250)] mt-0.5">
          Real-time dataset health, quality controls, and distribution trends
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[oklch(0.88_0.02_250)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Submissions</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {data.totalSubmissions.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Started: {data.totalStarted}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[oklch(0.88_0.02_250)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Completion Rate</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {data.completionRate}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Form finish conversion
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[oklch(0.88_0.02_250)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Avg. Word Length</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {data.avgWordCount}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Words per response
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[oklch(0.88_0.02_250)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Pastes Intercepted</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {data.totalPasteAttempts}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Anti-bot protection events
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-[oklch(0.88_0.02_250)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-800">Category Distribution</h3>
            <span className="text-xs text-slate-400">Responses by prompt type</span>
          </div>

          <div className="h-[280px] w-full">
            {data.categoryDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No response data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="category" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="oklch(0.42 0.16 250)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Daily Trend */}
        <div className="bg-white p-6 rounded-2xl border border-[oklch(0.88_0.02_250)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-800">Daily Submissions Trend</h3>
            <span className="text-xs text-slate-400">Past 30 days</span>
          </div>

          <div className="h-[280px] w-full">
            {data.dailyTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No submissions in past 30 days
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    fill="#93c5fd"
                    fillOpacity={0.4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Transliteration Robustness (3-Tier Reliability) ── */}
      {data.transliterationMetrics && (
        <div className="bg-white rounded-2xl border border-[oklch(0.88_0.02_250)] p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[oklch(0.42_0.16_250)] flex items-center justify-center">
                <Languages className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">
                  Transliteration Robustness &amp; 3-Tier Telemetry
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time uptime and latency across Cache, Google Input Tools, and Local Fallback
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              {data.transliterationMetrics.successRate}% Success Rate
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {data.transliterationMetrics.cacheHitRate}%
              </div>
              <div className="text-xs font-semibold text-slate-700 mt-0.5">Tier 1: Cache Hit Rate</div>
              <div className="text-[11px] text-slate-400 mt-1">
                ({data.transliterationMetrics.cacheHits} / {data.transliterationMetrics.totalAttempts} words)
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.transliterationMetrics.googleHitRate}%
              </div>
              <div className="text-xs font-semibold text-slate-700 mt-0.5">Tier 2: Google API Rate</div>
              <div className="text-[11px] text-slate-400 mt-1">
                ({data.transliterationMetrics.googleHits} words via API)
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-600 flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>{data.transliterationMetrics.avgLatencyMs}ms</span>
              </div>
              <div className="text-xs font-semibold text-slate-700 mt-0.5">Average Latency</div>
              <div className="text-[11px] text-slate-400 mt-1">
                (Cache: &lt;1ms, Google: ~90ms)
              </div>
            </div>
          </div>

          {/* 3-Tier Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Tier</th>
                  <th className="p-2.5">Engine Strategy</th>
                  <th className="p-2.5 text-right">Hits</th>
                  <th className="p-2.5 text-right">Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-2.5 font-semibold text-slate-800">Tier 1</td>
                  <td className="p-2.5">300-Word High Frequency In-Memory Cache</td>
                  <td className="p-2.5 text-right font-mono">{data.transliterationMetrics.cacheHits}</td>
                  <td className="p-2.5 text-right font-semibold text-emerald-700">{data.transliterationMetrics.cacheHitRate}%</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-slate-800">Tier 2</td>
                  <td className="p-2.5">Google Input Tools API (with 3s timeout)</td>
                  <td className="p-2.5 text-right font-mono">{data.transliterationMetrics.googleHits}</td>
                  <td className="p-2.5 text-right font-semibold text-blue-700">{data.transliterationMetrics.googleHitRate}%</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-slate-800">Tier 3</td>
                  <td className="p-2.5">Local Rule-Based Offline Engine (mapper.ts)</td>
                  <td className="p-2.5 text-right font-mono">{data.transliterationMetrics.fallbackHits}</td>
                  <td className="p-2.5 text-right font-semibold text-amber-700">{data.transliterationMetrics.fallbackHitRate}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
