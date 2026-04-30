// 追加: 管理画面 売上サマリ CSV エクスポート API
// GET /api/admin/export/sales?from=YYYY-MM-DD&to=YYYY-MM-DD&granularity=day|month
//   後方互換: granularity=daily|monthly も受理する
// 管理者ロール必須。CANCELLED / PENDING は集計対象外、REFUNDED は totalPrice を加算しつつ refundedAmount を控除する。
// 変更 (#133): 集計ロジックを lib/salesReport / lib/db/stats.findSalesByPeriod に寄せ、
//              「日付/月」「注文数」「売上合計」「返金額」「純売上」の 5 列に拡張した。
//              入力 from / to は JST のカレンダー日付として解釈し、半開区間 [from, to) で集計する。
import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { toCsvWithBom } from '@/lib/csv'
import { findSalesByPeriod } from '@/lib/db/stats'
import { buildSalesCsvRows, parseGranularity, parseJstDateInput } from '@/lib/salesReport'

// JST のタイムゾーンオフセット（ミリ秒）。salesReport.ts と同一の固定値。
const JST_OFFSET_MS = 9 * 60 * 60 * 1000

// デフォルト期間: 直近 30 日（day）/ 直近 12 ヶ月（month）
const DEFAULT_DAYS = 30
const DEFAULT_MONTHS = 12

export const GET = async (req: NextRequest) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  const granularity = parseGranularity(req.nextUrl.searchParams.get('granularity'))

  // 入力は JST のカレンダー日付として解釈し、半開区間 [from, to) を構築する
  const toBoundary = parseJstDateInput(req.nextUrl.searchParams.get('to'), 'to')
  const fromBoundary = parseJstDateInput(req.nextUrl.searchParams.get('from'), 'from')

  const now = new Date()
  // to 未指定時は現在時刻（now < 翌日 00:00 JST のため半開区間の右端として安全）
  const to = toBoundary ?? now

  let from: Date
  if (fromBoundary) {
    from = fromBoundary
  } else if (granularity === 'month') {
    // JST 当月 1 日 00:00 から (DEFAULT_MONTHS - 1) ヶ月遡る
    const jst = new Date(to.getTime() + JST_OFFSET_MS)
    from = new Date(
      Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth() - (DEFAULT_MONTHS - 1), 1) -
        JST_OFFSET_MS,
    )
  } else {
    // JST 当日 00:00 から (DEFAULT_DAYS - 1) 日遡る
    const jst = new Date(to.getTime() + JST_OFFSET_MS)
    from = new Date(
      Date.UTC(
        jst.getUTCFullYear(),
        jst.getUTCMonth(),
        jst.getUTCDate() - (DEFAULT_DAYS - 1),
      ) - JST_OFFSET_MS,
    )
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
