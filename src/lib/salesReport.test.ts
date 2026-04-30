// 追加 (#133): salesReport ヘルパーの単体テスト
import { describe, it, expect } from 'vitest'
import {
  buildSalesCsvRows,
  enumerateBucketKeys,
  fillMissingBuckets,
  formatBucketKeyJST,
  parseGranularity,
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
