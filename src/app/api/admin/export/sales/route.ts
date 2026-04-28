// 追加: 管理画面 売上サマリ CSV エクスポート API
// GET /api/admin/export/sales?from=YYYY-MM-DD&to=YYYY-MM-DD&granularity=daily|monthly
// 管理者ロール必須。CANCELLED を除く注文を集計する。
import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { toCsvWithBom } from '@/lib/csv'

const parseDate = (s: string | null): Date | undefined => {
  if (!s) return undefined
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? undefined : d
}

// 日次/月次のキー（YYYY-MM-DD or YYYY-MM）を生成
const formatKey = (d: Date, granularity: 'daily' | 'monthly'): string => {
  const iso = d.toISOString()
  return granularity === 'monthly' ? iso.slice(0, 7) : iso.slice(0, 10)
}

export const GET = async (req: NextRequest) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  const from = parseDate(req.nextUrl.searchParams.get('from'))
  const to = parseDate(req.nextUrl.searchParams.get('to'))
  const granularityRaw = req.nextUrl.searchParams.get('granularity')
  const granularity: 'daily' | 'monthly' = granularityRaw === 'monthly' ? 'monthly' : 'daily'

  const orders = await prisma.order.findMany({
    where: {
      status: { not: 'CANCELLED' },
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    select: { createdAt: true, totalPrice: true },
    orderBy: { createdAt: 'asc' },
  })

  // 期間ごとに集計
  const aggregated = new Map<string, { count: number; total: number }>()
  for (const o of orders) {
    const key = formatKey(o.createdAt, granularity)
    const cur = aggregated.get(key) ?? { count: 0, total: 0 }
    cur.count += 1
    cur.total += o.totalPrice
    aggregated.set(key, cur)
  }

  const headers =
    granularity === 'monthly'
      ? (['月', '注文数', '売上合計（円）'] as const)
      : (['日付', '注文数', '売上合計（円）'] as const)

  const rows = Array.from(aggregated.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([key, v]) => [key, v.count, v.total])

  const buf = toCsvWithBom(headers, rows)
  const filename = `sales_${granularity}_${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(buf as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
