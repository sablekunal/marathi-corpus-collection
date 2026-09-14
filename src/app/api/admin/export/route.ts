import { NextRequest, NextResponse } from 'next/server'
import { getExportData, toCSV, toJSON, toJSONL } from '@/lib/export/generators'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'json'
    const formId = searchParams.get('formId') || undefined
    const minQualityStr = searchParams.get('minQuality')
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const minQuality = minQualityStr ? parseInt(minQualityStr, 10) : undefined

    const data = await getExportData({ formId, minQuality, startDate, endDate })

    const dateStr = new Date().toISOString().split('T')[0]

    if (format === 'csv') {
      const csv = toCSV(data)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="marathi_corpus_${dateStr}.csv"`,
        },
      })
    }

    if (format === 'jsonl') {
      const jsonl = toJSONL(data)
      return new NextResponse(jsonl, {
        headers: {
          'Content-Type': 'application/x-ndjson; charset=utf-8',
          'Content-Disposition': `attachment; filename="marathi_corpus_${dateStr}.jsonl"`,
        },
      })
    }

    // Default JSON
    const json = toJSON(data)
    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="marathi_corpus_${dateStr}.json"`,
      },
    })
  } catch (err) {
    console.error('[GET /api/admin/export]', err)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
