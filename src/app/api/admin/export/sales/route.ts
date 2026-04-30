// 追加: 管理画面 売上サマリ CSV エクスポート API
// GET /api/admin/export/sales?from=YYYY-MM-DD&to=YYYY-MM-DD&granularity=day|month
//   後方互換: granularity=daily|monthly も受理する
// 管理者ロール必須。CANCELLED / PENDING は集計対象外、REFUNDED は totalPrice を加算しつつ refundedAmount を控除する。
// 変更 (#133): 集計ロジックを lib/salesReport / lib/db/stats.findSalesByPeriod に寄せ、
//              「日付/月」「注文数」「売上合計」「返金額」「純売上」の 5 列に拡張した。
import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { toCsvWithBom } from '@/lib/csv'
import { findSalesByPeriod } from '@/lib/db/stats'
import { buildSalesCsvRows, parseGranularity } from '@/lib/salesReport'

const parseDate = (s: string | null): Date | undefined => {
  if (!s) return undefined
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? undefined : d
}

// デフォルト期間: 直近 30 日（day）/ 直近 12 ヶ月（month）
const DEFAULT_DAYS = 30
const DEFAULT_MONTHS = 12

export const GET = async (req: NextRequest) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  const granularity = parseGranularity(req.nextUrl.searchParams.get('granularity'))

  // 期間未指定時は現在時刻を to、from は粒度に応じてさかのぼる
  const now = new Date()
  const to = parseDate(req.nextUrl.searchParams.get('to')) ?? now
  const fromParam = parseDate(req.nextUrl.searchParams.get('from'))
  let from: Date
  if (fromParam) {
    from = fromParam
  } else if (granularity === 'month') {
    const d = new Date(to)
    d.setMonth(d.getMonth() - (DEFAULT_MONTHS - 1))
    from = d
  } else {
    const d = new Date(to)
    d.setDate(d.getDate() - (DEFAULT_DAYS - 1))
    from = d
  }

  const buckets = await findSalesByPeriod({ from, to, granularity })
  const { headers, rows } = buildSalesCsvRows(buckets, granularity)

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
