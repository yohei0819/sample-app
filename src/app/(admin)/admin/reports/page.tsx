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
  getDefaultFromBoundary,
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

  // from 未指定時は granularity に応じて JST 基準のデフォルト期間を算出
  const from =
    fromBoundary ??
    getDefaultFromBoundary(to, granularity, { days: DEFAULT_DAYS, months: DEFAULT_MONTHS })

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
