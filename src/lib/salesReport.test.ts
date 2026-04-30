// 追加 (#133): salesReport ヘルパーの単体テスト
import { describe, it, expect } from 'vitest'
import {
  buildSalesCsvRows,
  enumerateBucketKeys,
  fillMissingBuckets,
  formatBucketKeyJST,
  getDefaultFromBoundary,
  parseGranularity,
  parseJstDateInput,
  summarizeKpi,
} from './salesReport'

describe('parseGranularity', () => {
  it('day / daily → day', () => {
    expect(parseGranularity('day')).toBe('day')
    expect(parseGranularity('daily')).toBe('day')
  })
  it('month / monthly → month', () => {
    expect(parseGranularity('month')).toBe('month')
    expect(parseGranularity('monthly')).toBe('month')
  })
  it('null / 不正値はデフォルトで day', () => {
    expect(parseGranularity(null)).toBe('day')
    expect(parseGranularity(undefined)).toBe('day')
    expect(parseGranularity('week')).toBe('day')
  })
})

describe('formatBucketKeyJST', () => {
  // 2026-04-30T15:00:00Z = 2026-05-01 00:00 JST → 月跨ぎを正しく扱えること
  it('UTC 15:00 は JST では翌日扱い（day）', () => {
    expect(formatBucketKeyJST(new Date('2026-04-30T15:00:00Z'), 'day')).toBe('2026-05-01')
  })
  it('UTC 14:59 は JST では同日扱い（day）', () => {
    expect(formatBucketKeyJST(new Date('2026-04-30T14:59:00Z'), 'day')).toBe('2026-04-30')
  })
  it('month 粒度では YYYY-MM になる', () => {
    expect(formatBucketKeyJST(new Date('2026-04-30T15:00:00Z'), 'month')).toBe('2026-05')
  })
})

describe('enumerateBucketKeys', () => {
  it('day 粒度で from〜to の連続日付を JST 基準で列挙する', () => {
    const from = new Date('2026-04-28T15:00:00Z') // JST 2026-04-29
    const to = new Date('2026-05-01T15:00:00Z') // JST 2026-05-02
    expect(enumerateBucketKeys(from, to, 'day')).toEqual([
      '2026-04-29',
      '2026-04-30',
      '2026-05-01',
      '2026-05-02',
    ])
  })

  it('month 粒度で年跨ぎを連続列挙する', () => {
    const from = new Date('2025-11-15T00:00:00Z')
    const to = new Date('2026-02-10T00:00:00Z')
    expect(enumerateBucketKeys(from, to, 'month')).toEqual([
      '2025-11',
      '2025-12',
      '2026-01',
      '2026-02',
    ])
  })

  it('from > to の場合は空配列', () => {
    const from = new Date('2026-05-01T00:00:00Z')
    const to = new Date('2026-04-01T00:00:00Z')
    expect(enumerateBucketKeys(from, to, 'day')).toEqual([])
  })
})

describe('fillMissingBuckets', () => {
  it('欠損バケットを 0 埋めし net を計算する', () => {
    const from = new Date('2026-04-29T00:00:00Z')
    const to = new Date('2026-05-01T00:00:00Z')
    const rows = [
      { bucket: '2026-04-29', orderCount: 2, gross: 5000, refund: 0 },
      { bucket: '2026-05-01', orderCount: 3, gross: 8000, refund: 1000 },
    ]
    const filled = fillMissingBuckets(rows, from, to, 'day')
    expect(filled).toEqual([
      { bucket: '2026-04-29', orderCount: 2, gross: 5000, refund: 0, net: 5000 },
      { bucket: '2026-04-30', orderCount: 0, gross: 0, refund: 0, net: 0 },
      { bucket: '2026-05-01', orderCount: 3, gross: 8000, refund: 1000, net: 7000 },
    ])
  })
})

describe('summarizeKpi', () => {
  it('合計と平均注文単価を集計する', () => {
    const kpi = summarizeKpi([
      { bucket: '2026-04-29', orderCount: 2, gross: 5000, refund: 0, net: 5000 },
      { bucket: '2026-04-30', orderCount: 0, gross: 0, refund: 0, net: 0 },
      { bucket: '2026-05-01', orderCount: 3, gross: 8000, refund: 1000, net: 7000 },
    ])
    expect(kpi).toEqual({
      totalGross: 13000,
      totalRefund: 1000,
      totalNet: 12000,
      totalOrders: 5,
      averageOrderValue: Math.round(13000 / 5),
    })
  })

  it('注文数 0 の場合は averageOrderValue が 0', () => {
    const kpi = summarizeKpi([])
    expect(kpi.totalGross).toBe(0)
    expect(kpi.totalOrders).toBe(0)
    expect(kpi.averageOrderValue).toBe(0)
  })
})

describe('buildSalesCsvRows', () => {
  const buckets = [
    { bucket: '2026-04-29', orderCount: 2, gross: 5000, refund: 0, net: 5000 },
    { bucket: '2026-04-30', orderCount: 1, gross: 3000, refund: 500, net: 2500 },
  ]

  it('day 粒度のヘッダ・行を生成する', () => {
    const { headers, rows } = buildSalesCsvRows(buckets, 'day')
    expect(headers[0]).toBe('日付')
    expect(headers).toHaveLength(5)
    expect(rows).toEqual([
      ['2026-04-29', 2, 5000, 0, 5000],
      ['2026-04-30', 1, 3000, 500, 2500],
    ])
  })

  it('month 粒度ではラベルが「月」になる', () => {
    const { headers } = buildSalesCsvRows(buckets, 'month')
    expect(headers[0]).toBe('月')
  })
})

describe('parseJstDateInput', () => {
  // 2026-04-30 00:00 JST = 2026-04-29 15:00 UTC
  it("kind='from' は 'YYYY-MM-DD' を JST 当日 00:00（= UTC 前日 15:00）として返す", () => {
    const d = parseJstDateInput('2026-04-30', 'from')
    expect(d).toBeInstanceOf(Date)
    expect(d!.toISOString()).toBe('2026-04-29T15:00:00.000Z')
  })
  // to=2026-04-30 → 翌日 00:00 JST = 2026-04-30 15:00 UTC（半開区間の右端）
  it("kind='to' は翌日 00:00 JST に正規化する（半開区間の右端）", () => {
    const d = parseJstDateInput('2026-04-30', 'to')
    expect(d!.toISOString()).toBe('2026-04-30T15:00:00.000Z')
  })
  // 月末→翌月 1 日へオーバーフロー（Date.UTC が吸収）
  it("kind='to' で月末の場合は翌月 1 日 00:00 JST になる", () => {
    const d = parseJstDateInput('2026-04-30', 'to')
    // 2026-05-01 00:00 JST = 2026-04-30 15:00 UTC
    expect(d!.toISOString()).toBe('2026-04-30T15:00:00.000Z')
  })
  it("kind='to' で 12 月末は翌年 1 月 1 日 00:00 JST になる", () => {
    const d = parseJstDateInput('2026-12-31', 'to')
    // 2027-01-01 00:00 JST = 2026-12-31 15:00 UTC
    expect(d!.toISOString()).toBe('2026-12-31T15:00:00.000Z')
  })
  it('空文字 / null / undefined は undefined', () => {
    expect(parseJstDateInput('', 'from')).toBeUndefined()
    expect(parseJstDateInput(null, 'from')).toBeUndefined()
    expect(parseJstDateInput(undefined, 'to')).toBeUndefined()
  })
  it('フォーマット不正は undefined', () => {
    expect(parseJstDateInput('2026/04/30', 'from')).toBeUndefined()
    expect(parseJstDateInput('2026-4-30', 'from')).toBeUndefined()
    expect(parseJstDateInput('abc', 'from')).toBeUndefined()
  })
  it('月・日が範囲外なら undefined（13 月や 32 日は弾く）', () => {
    expect(parseJstDateInput('2026-13-01', 'from')).toBeUndefined()
    expect(parseJstDateInput('2026-00-01', 'from')).toBeUndefined()
    expect(parseJstDateInput('2026-04-32', 'from')).toBeUndefined()
    expect(parseJstDateInput('2026-04-00', 'from')).toBeUndefined()
  })
  // 追加 (#133): 暦上存在しない日付のラウンドトリップ検証
  it('暦上存在しない日付（2/30・4/31 など）は undefined', () => {
    expect(parseJstDateInput('2026-02-30', 'from')).toBeUndefined()
    expect(parseJstDateInput('2026-02-29', 'from')).toBeUndefined() // 平年
    expect(parseJstDateInput('2026-04-31', 'from')).toBeUndefined()
    expect(parseJstDateInput('2026-06-31', 'from')).toBeUndefined()
    expect(parseJstDateInput('2026-09-31', 'to')).toBeUndefined()
    expect(parseJstDateInput('2026-11-31', 'to')).toBeUndefined()
  })
  it('うるう年の 2/29 は受理する', () => {
    // 2024 はうるう年。2024-02-29 00:00 JST = 2024-02-28 15:00 UTC
    const d = parseJstDateInput('2024-02-29', 'from')
    expect(d).toBeInstanceOf(Date)
    expect(d!.toISOString()).toBe('2024-02-28T15:00:00.000Z')
  })
  it('各月の最終日（1/31・3/31・12/31 など）は受理する', () => {
    expect(parseJstDateInput('2026-01-31', 'from')!.toISOString()).toBe(
      '2026-01-30T15:00:00.000Z',
    )
    expect(parseJstDateInput('2026-03-31', 'from')!.toISOString()).toBe(
      '2026-03-30T15:00:00.000Z',
    )
    expect(parseJstDateInput('2026-04-30', 'from')!.toISOString()).toBe(
      '2026-04-29T15:00:00.000Z',
    )
    expect(parseJstDateInput('2026-12-31', 'from')!.toISOString()).toBe(
      '2026-12-30T15:00:00.000Z',
    )
  })
  // 集計クエリと整合：from='2026-04-30' / to='2026-04-30' で「JST 4/30 全日」を半開区間でカバー
  it('同日の from / to で JST 当日全 24 時間を半開区間でカバーする', () => {
    const from = parseJstDateInput('2026-04-30', 'from')!
    const to = parseJstDateInput('2026-04-30', 'to')!
    expect(to.getTime() - from.getTime()).toBe(24 * 60 * 60 * 1000)
  })
})

// 追加 (#133): デフォルト期間ヘルパーのテスト
describe('getDefaultFromBoundary', () => {
  const opts = { days: 30, months: 12 }

  it("granularity='day' で to を含む JST 当日から 29 日遡った 00:00 JST を返す", () => {
    // to = 2026-04-30 12:34 JST → JST 当日 = 2026-04-30
    // 29 日遡る → 2026-04-01 00:00 JST = 2026-03-31 15:00 UTC
    const to = new Date('2026-04-30T03:34:00.000Z') // 2026-04-30 12:34 JST
    const from = getDefaultFromBoundary(to, 'day', opts)
    expect(from.toISOString()).toBe('2026-03-31T15:00:00.000Z')
  })

  it("granularity='month' で to を含む JST 当月から 11 ヶ月遡った 1 日 00:00 JST を返す", () => {
    // to = 2026-04-30 12:34 JST → JST 当月 = 2026-04
    // 11 ヶ月遡る → 2025-05-01 00:00 JST = 2025-04-30 15:00 UTC
    const to = new Date('2026-04-30T03:34:00.000Z')
    const from = getDefaultFromBoundary(to, 'month', opts)
    expect(from.toISOString()).toBe('2025-04-30T15:00:00.000Z')
  })

  it('JST 日付境界（UTC 15:00 == JST 翌日 00:00）を正しく扱う', () => {
    // 2026-04-29 15:00 UTC = 2026-04-30 00:00 JST
    const to = new Date('2026-04-29T15:00:00.000Z')
    const from = getDefaultFromBoundary(to, 'day', opts)
    // JST 当日 = 2026-04-30 → 29 日遡って 2026-04-01 00:00 JST
    expect(from.toISOString()).toBe('2026-03-31T15:00:00.000Z')
  })

  it('parseJstDateInput が返す境界 Date を入力しても期待通り動作する', () => {
    const to = parseJstDateInput('2026-04-30', 'to')! // 2026-05-01 00:00 JST
    const from = getDefaultFromBoundary(to, 'day', opts)
    // JST 当日 = 2026-05-01 → 29 日遡って 2026-04-02 00:00 JST = 2026-04-01 15:00 UTC
    expect(from.toISOString()).toBe('2026-04-01T15:00:00.000Z')
  })
})
