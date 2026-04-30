// 追加 (#133): 売上レポート集計の共通ロジック（DB 非依存・純粋関数）
// - 集計粒度（日別/月別）の正規化
// - JST 固定でのバケットキー整形・期間列挙
// - DB 集計結果と粒度から KPI と CSV 行を生成

// 集計粒度
export type Granularity = 'day' | 'month'

// 1 バケット（日 or 月）の集計結果
export type SalesBucket = {
  // 'YYYY-MM-DD'（day）または 'YYYY-MM'（month）。JST 固定。
  bucket: string
  orderCount: number
  // 注文金額の合計（円）。CANCELLED は除外、REFUNDED 等は totalPrice として加算される。
  gross: number
  // 返金額の合計（円）。Order.refundedAmount を集計したもの。
  refund: number
  // 純売上 = gross - refund
  net: number
}

// 期間全体の KPI
export type SalesKpi = {
  totalGross: number
  totalRefund: number
  totalNet: number
  totalOrders: number
  // 平均注文単価（円・整数丸め）。注文数 0 の場合は 0 を返す。
  averageOrderValue: number
}

// JST のタイムゾーンオフセット（ミリ秒）。
// 注: 日本標準時は固定 UTC+9 で DST も歴史的変動も無いため、定数オフセットで安全に扱える。
//     既存データもすべて JST 前提で運用されている想定。
const JST_OFFSET_MS = 9 * 60 * 60 * 1000

// granularity クエリパラメータの正規化
// - day / daily → 'day'
// - month / monthly → 'month'
// - それ以外 → 'day'
export const parseGranularity = (input: string | null | undefined): Granularity => {
  if (input === 'month' || input === 'monthly') return 'month'
  return 'day'
}

// 追加 (#133): 'YYYY-MM-DD' 入力を JST のカレンダー日付として境界 Date に正規化する。
// 集計クエリは AT TIME ZONE 'Asia/Tokyo' で JST バケット化するため、入力側も JST 基準で
// 半開区間 [from, to) を構築する必要がある。
// - kind='from' → 当該日付の 00:00 JST を表す Date（UTC では前日 15:00）
// - kind='to'   → 当該日付の翌日 00:00 JST を表す Date（半開区間の右端）
// 不正値 / undefined / 空文字は undefined を返す。
export const parseJstDateInput = (
  input: string | null | undefined,
  kind: 'from' | 'to',
): Date | undefined => {
  if (!input) return undefined
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input)
  if (!m) return undefined
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  // 月・日の上下限を粗く弾く（13月・32日・0日など）
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined
  // 暦上存在しない日付（'2026-02-30' / 平年の '2025-02-29' / '2026-04-31' 等）を弾く。
  // Date.UTC は overflow を吸収してしまうため、ラウンドトリップで Y/M/D の一致を確認する。
  const probe = new Date(Date.UTC(year, month - 1, day))
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return undefined
  }
  // to は半開区間の右端なので翌日 00:00 JST に正規化（Date.UTC が日付 overflow を吸収）
  const dayOffset = kind === 'to' ? 1 : 0
  const utcMs = Date.UTC(year, month - 1, day + dayOffset) - JST_OFFSET_MS
  const date = new Date(utcMs)
  if (Number.isNaN(date.getTime())) return undefined
  return date
}

// 追加 (#133): from 未指定時のデフォルト開始境界を JST 基準で算出する共通ヘルパー。
// page.tsx と route.ts で重複していた JST 変換ロジックを集約する。
// - granularity='day'   → to を含む JST 当日 00:00 から (DEFAULT_DAYS - 1) 日遡る
// - granularity='month' → to を含む JST 当月 1 日 00:00 から (DEFAULT_MONTHS - 1) ヶ月遡る
export const getDefaultFromBoundary = (
  to: Date,
  granularity: Granularity,
  options: { days: number; months: number },
): Date => {
  // to は parseJstDateInput が返す JST 境界、もしくは「現在時刻」のいずれか。
  // どちらの場合も +JST_OFFSET_MS して UTC として読めば JST のカレンダー値が得られる。
  const jst = new Date(to.getTime() + JST_OFFSET_MS)
  const y = jst.getUTCFullYear()
  const m = jst.getUTCMonth()
  const d = jst.getUTCDate()
  if (granularity === 'month') {
    return new Date(Date.UTC(y, m - (options.months - 1), 1) - JST_OFFSET_MS)
  }
  return new Date(Date.UTC(y, m, d - (options.days - 1)) - JST_OFFSET_MS)
}

// 任意の Date を JST 固定で 'YYYY-MM-DD' / 'YYYY-MM' に整形
export const formatBucketKeyJST = (date: Date, granularity: Granularity): string => {
  // UTC に +9h 加算して JST のカレンダー日付を取得
  const jst = new Date(date.getTime() + JST_OFFSET_MS)
  const y = jst.getUTCFullYear()
  const m = String(jst.getUTCMonth() + 1).padStart(2, '0')
  if (granularity === 'month') return `${y}-${m}`
  const d = String(jst.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// from〜to（両端含む）の範囲で JST 基準のバケットキーを連続列挙する
export const enumerateBucketKeys = (
  from: Date,
  to: Date,
  granularity: Granularity,
): string[] => {
  const keys: string[] = []
  if (from.getTime() > to.getTime()) return keys

  const fromJst = new Date(from.getTime() + JST_OFFSET_MS)
  const toJst = new Date(to.getTime() + JST_OFFSET_MS)

  if (granularity === 'day') {
    // JST 日付の 00:00 を UTC で表現したカーソル（純粋にカレンダー算術として扱う）
    const cursor = new Date(
      Date.UTC(fromJst.getUTCFullYear(), fromJst.getUTCMonth(), fromJst.getUTCDate()),
    )
    const end = new Date(
      Date.UTC(toJst.getUTCFullYear(), toJst.getUTCMonth(), toJst.getUTCDate()),
    )
    while (cursor.getTime() <= end.getTime()) {
      const y = cursor.getUTCFullYear()
      const m = String(cursor.getUTCMonth() + 1).padStart(2, '0')
      const d = String(cursor.getUTCDate()).padStart(2, '0')
      keys.push(`${y}-${m}-${d}`)
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
  } else {
    const cursor = new Date(Date.UTC(fromJst.getUTCFullYear(), fromJst.getUTCMonth(), 1))
    const end = new Date(Date.UTC(toJst.getUTCFullYear(), toJst.getUTCMonth(), 1))
    while (cursor.getTime() <= end.getTime()) {
      const y = cursor.getUTCFullYear()
      const m = String(cursor.getUTCMonth() + 1).padStart(2, '0')
      keys.push(`${y}-${m}`)
      cursor.setUTCMonth(cursor.getUTCMonth() + 1)
    }
  }

  return keys
}

// DB 集計結果（疎な配列）に欠損バケットを 0 埋めし、net を計算した連続配列にする
export const fillMissingBuckets = (
  rows: ReadonlyArray<{ bucket: string; orderCount: number; gross: number; refund: number }>,
  from: Date,
  to: Date,
  granularity: Granularity,
): SalesBucket[] => {
  const map = new Map(rows.map((r) => [r.bucket, r]))
  return enumerateBucketKeys(from, to, granularity).map((key) => {
    const r = map.get(key)
    const gross = r?.gross ?? 0
    const refund = r?.refund ?? 0
    return {
      bucket: key,
      orderCount: r?.orderCount ?? 0,
      gross,
      refund,
      net: gross - refund,
    }
  })
}

// バケット配列から KPI を集計
// 注: averageOrderValue は「平均注文単価（顧客が実際に支払った 1 件あたりの金額）」を意図しており、
//     totalGross / totalOrders で算出する。返金は注文後の事後処理のため単価の按分には含めない。
//     純売上は別途 totalNet として表示する。
export const summarizeKpi = (buckets: ReadonlyArray<SalesBucket>): SalesKpi => {
  let totalGross = 0
  let totalRefund = 0
  let totalOrders = 0
  for (const b of buckets) {
    totalGross += b.gross
    totalRefund += b.refund
    totalOrders += b.orderCount
  }
  const totalNet = totalGross - totalRefund
  const averageOrderValue = totalOrders === 0 ? 0 : Math.round(totalGross / totalOrders)
  return { totalGross, totalRefund, totalNet, totalOrders, averageOrderValue }
}

// CSV 用ヘッダ・行の生成（粒度でラベル列だけ切り替え）
export const buildSalesCsvRows = (
  buckets: ReadonlyArray<SalesBucket>,
  granularity: Granularity,
): { headers: readonly string[]; rows: ReadonlyArray<readonly unknown[]> } => {
  const headers =
    granularity === 'month'
      ? (['月', '注文数', '売上合計（円）', '返金額（円）', '純売上（円）'] as const)
      : (['日付', '注文数', '売上合計（円）', '返金額（円）', '純売上（円）'] as const)
  const rows = buckets.map(
    (b) => [b.bucket, b.orderCount, b.gross, b.refund, b.net] as const,
  )
  return { headers, rows }
}
