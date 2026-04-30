// 追加 (#133): 売上レポート ページ（Server Component）
// /admin/reports?from=YYYY-MM-DD&to=YYYY-MM-DD&granularity=day|month
// - 期間内売上合計 / 注文数 / 平均注文単価 / 返金額 を KPI カードで表示
// - 自前 SVG 折れ線グラフで net（純売上）の推移を表示
// - 同条件の CSV ダウンロードリンクを提供
// - 入力日付は JST のカレンダー日付として解釈し、半開区間 [from, to) で集計する
import { SalesReportChart } from '@/components/features/admin/SalesReportChart'
import { SalesReportFilters } from '@/components/features/admin/SalesReportFilters'
import { SalesReportKpi } from '@/components/features/admin/SalesReportKpi'
import { findSalesByPeriod } from '@/lib/db/stats'
import {
  formatBucketKeyJST,
  parseGranularity,
  parseJstDateInput,
  summarizeKpi,
  type Granularity,
} from '@/lib/salesReport'

// 管理画面は DB 必須のため動的レンダリングを強制
export const dynamic = 'force-dynamic'

export const metadata = {
  title: '売上レポート | 管理画面',
}

// デフォルト期間: 直近 30 日（day）/ 直近 12 ヶ月（month）
const DEFAULT_DAYS = 30
const DEFAULT_MONTHS = 12

// JST のタイムゾーンオフセット（ミリ秒）。salesReport.ts と同一の固定値。
const JST_OFFSET_MS = 9 * 60 * 60 * 1000

// 任意の Date から JST 当日 00:00 JST の Date を返す（カレンダー算術用）
const startOfJstDay = (d: Date): Date => {
  const jst = new Date(d.getTime() + JST_OFFSET_MS)
  const utcMs =
    Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate()) - JST_OFFSET_MS
  return new Date(utcMs)
}

// 任意の Date から JST 当月 1 日 00:00 JST の Date を返す
const startOfJstMonth = (d: Date): Date => {
  const jst = new Date(d.getTime() + JST_OFFSET_MS)
  const utcMs = Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), 1) - JST_OFFSET_MS
  return new Date(utcMs)
}

// searchParams から first value を取り出すユーティリティ（配列形式に備える）
const firstParam = (v: string | string[] | undefined): string | undefined => {
  if (Array.isArray(v)) return v[0]
  return v
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ReportsPage({ searchParams }: Props) {
  const sp = await searchParams
  const granularity: Granularity = parseGranularity(firstParam(sp.granularity))

  const fromInput = firstParam(sp.from)
  const toInput = firstParam(sp.to)

  // 入力は JST のカレンダー日付として解釈し、半開区間 [from, to) を構築する
  const fromBoundary = parseJstDateInput(fromInput, 'from')
  const toBoundary = parseJstDateInput(toInput, 'to')

  const now = new Date()
  // to 未指定時は現在時刻（now < 翌日 00:00 JST のため半開区間の右端として安全）
  const to = toBoundary ?? now

  let from: Date
  if (fromBoundary) {
    from = fromBoundary
  } else if (granularity === 'month') {
    // JST 当月 1 日 00:00 から (DEFAULT_MONTHS - 1) ヶ月遡る
    const base = startOfJstMonth(to)
    const jst = new Date(base.getTime() + JST_OFFSET_MS)
    from = new Date(
      Date.UTC(
        jst.getUTCFullYear(),
        jst.getUTCMonth() - (DEFAULT_MONTHS - 1),
        1,
      ) - JST_OFFSET_MS,
    )
  } else {
    // JST 当日 00:00 から (DEFAULT_DAYS - 1) 日遡る
    const base = startOfJstDay(to)
    const jst = new Date(base.getTime() + JST_OFFSET_MS)
    from = new Date(
      Date.UTC(
        jst.getUTCFullYear(),
        jst.getUTCMonth(),
        jst.getUTCDate() - (DEFAULT_DAYS - 1),
      ) - JST_OFFSET_MS,
    )
  }

  const buckets = await findSalesByPeriod({ from, to, granularity })
  const kpi = summarizeKpi(buckets)

  // 表示用の 'YYYY-MM-DD' は JST 基準で算出
  // - 入力値があればそのまま（ユーザの選択日を尊重）
  // - 未指定時は from / now を JST 日付に整形（to 表示は現在時刻の JST 当日）
  const fromDisplay = fromInput ?? formatBucketKeyJST(from, 'day')
  const toDisplay = toInput ?? formatBucketKeyJST(now, 'day')

  // 現在のフィルタ条件をそのまま CSV エクスポート API に引き継ぐ
  const csvParams = new URLSearchParams({
    from: fromDisplay,
    to: toDisplay,
    granularity,
  })
  const csvHref = `/api/admin/export/sales?${csvParams.toString()}`

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">売上レポート</h1>
        <p className="text-sm text-muted-foreground">
          期間と粒度を指定して売上推移を確認できます（タイムゾーン: Asia/Tokyo）。
        </p>
      </div>

      <SalesReportFilters
        from={fromDisplay}
        to={toDisplay}
        granularity={granularity}
        csvHref={csvHref}
      />

      <SalesReportKpi kpi={kpi} />

      <section aria-labelledby="sales-trend-heading" className="space-y-2">
        <h2 id="sales-trend-heading" className="text-lg font-semibold tracking-tight">
          売上推移（純売上）
        </h2>
        <SalesReportChart buckets={buckets} granularity={granularity} />
      </section>
    </div>
  )
}
