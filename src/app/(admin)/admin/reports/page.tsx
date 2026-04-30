// 追加 (#133): 売上レポート ページ（Server Component）
// /admin/reports?from=YYYY-MM-DD&to=YYYY-MM-DD&granularity=day|month
// - 期間内売上合計 / 注文数 / 平均注文単価 / 返金額 を KPI カードで表示
// - 自前 SVG 折れ線グラフで net（純売上）の推移を表示
// - 同条件の CSV ダウンロードリンクを提供
import { SalesReportChart } from '@/components/features/admin/SalesReportChart'
import { SalesReportFilters } from '@/components/features/admin/SalesReportFilters'
import { SalesReportKpi } from '@/components/features/admin/SalesReportKpi'
import { findSalesByPeriod } from '@/lib/db/stats'
import { parseGranularity, summarizeKpi, type Granularity } from '@/lib/salesReport'

// 管理画面は DB 必須のため動的レンダリングを強制
export const dynamic = 'force-dynamic'

export const metadata = {
  title: '売上レポート | 管理画面',
}

// デフォルト期間: 直近 30 日（day）/ 直近 12 ヶ月（month）
const DEFAULT_DAYS = 30
const DEFAULT_MONTHS = 12

// 'YYYY-MM-DD' に整形（input[type=date] のデフォルト値用、ローカルタイムゾーンの日付）
const toDateInputValue = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 'YYYY-MM-DD' を Date に変換。空 / 不正値は undefined。
const parseDateParam = (s: string | undefined): Date | undefined => {
  if (!s) return undefined
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? undefined : d
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

  const now = new Date()
  const toParam = parseDateParam(firstParam(sp.to))
  const fromParam = parseDateParam(firstParam(sp.from))

  const to = toParam ?? now
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
  const kpi = summarizeKpi(buckets)

  // 現在のフィルタ条件をそのまま CSV エクスポート API に引き継ぐ
  const csvParams = new URLSearchParams({
    from: toDateInputValue(from),
    to: toDateInputValue(to),
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
        from={toDateInputValue(from)}
        to={toDateInputValue(to)}
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
