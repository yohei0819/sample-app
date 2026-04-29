// 追加 (#107): タイムセール sale.ts ユニットテスト
import { describe, it, expect } from 'vitest'
import type { Sale } from '@/generated/prisma/client'
import { getEffectivePrice, isSaleActive, getDiscountPercent } from '@/lib/sale'

const product = { id: 'p1', price: 1000 }
const now = new Date('2025-01-15T12:00:00Z')

const buildSale = (overrides: Partial<Sale> = {}): Sale => ({
  id: 's1',
  productId: 'p1',
  salePrice: 800,
  startsAt: new Date('2025-01-10T00:00:00Z'),
  endsAt: new Date('2025-01-20T00:00:00Z'),
  isActive: true,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
  ...overrides,
})

describe('getEffectivePrice', () => {
  it('セールが null の場合は通常価格を返す', () => {
    expect(getEffectivePrice(product, null, now)).toBe(1000)
  })

  it('適用中のセール価格を返す', () => {
    expect(getEffectivePrice(product, buildSale(), now)).toBe(800)
  })

  it('isActive=false の場合は通常価格', () => {
    expect(getEffectivePrice(product, buildSale({ isActive: false }), now)).toBe(1000)
  })

  it('期間外（開始前）は通常価格', () => {
    const before = new Date('2025-01-05T00:00:00Z')
    expect(getEffectivePrice(product, buildSale(), before)).toBe(1000)
  })

  it('期間外（終了後）は通常価格', () => {
    const after = new Date('2025-01-25T00:00:00Z')
    expect(getEffectivePrice(product, buildSale(), after)).toBe(1000)
  })

  it('salePrice >= price の異常データは通常価格', () => {
    expect(getEffectivePrice(product, buildSale({ salePrice: 1200 }), now)).toBe(1000)
  })
})

describe('isSaleActive', () => {
  it('期間内かつ isActive=true で true', () => {
    expect(isSaleActive(buildSale(), now)).toBe(true)
  })

  it('null は false', () => {
    expect(isSaleActive(null, now)).toBe(false)
  })

  it('終了時刻ちょうどは false（半開区間）', () => {
    const sale = buildSale()
    expect(isSaleActive(sale, sale.endsAt)).toBe(false)
  })
})

describe('getDiscountPercent', () => {
  it('20%引きを正しく計算', () => {
    expect(getDiscountPercent(product, buildSale(), now)).toBe(20)
  })

  it('セールなしは 0%', () => {
    expect(getDiscountPercent(product, null, now)).toBe(0)
  })
})
