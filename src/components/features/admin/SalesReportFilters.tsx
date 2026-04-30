// 追加 (#133): 売上レポート フィルタフォーム（Server Component）
// from / to / granularity を GET メソッドで送信し、ページの searchParams を更新する。
// 通常の <form method="get"> でクエリ更新を行うため Client Component 化は不要。
import type { Granularity } from '@/lib/salesReport'

type Props = {
  from: string // 'YYYY-MM-DD'
  to: string // 'YYYY-MM-DD'
  granularity: Granularity
  csvHref: string
}

export const SalesReportFilters = ({ from, to, granularity, csvHref }: Props) => {
  return (
    <form
      method="get"
      action="/admin/reports"
      className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4 shadow-sm"
      aria-label="売上レポートのフィルタ"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="report-from" className="text-xs font-medium text-muted-foreground">
          開始日
        </label>
        <input
          id="report-from"
          name="from"
          type="date"
          defaultValue={from}
          className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="report-to" className="text-xs font-medium text-muted-foreground">
          終了日
        </label>
        <input
          id="report-to"
          name="to"
          type="date"
          defaultValue={to}
          className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="report-granularity"
          className="text-xs font-medium text-muted-foreground"
        >
          粒度
        </label>
        <select
          id="report-granularity"
          name="granularity"
          defaultValue={granularity}
          className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm"
        >
          <option value="day">日別</option>
          <option value="month">月別</option>
        </select>
      </div>

      <button
        type="submit"
        className="inline-flex items-center rounded-md border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
      >
        反映
      </button>

      <a
        href={csvHref}
        className="inline-flex items-center rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent"
        aria-label="現在のフィルタ条件で売上レポートを CSV ダウンロード"
        data-testid="sales-report-csv-link"
      >
        CSV ダウンロード
      </a>
    </form>
  )
}
