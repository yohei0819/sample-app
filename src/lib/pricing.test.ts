// 追加 (#131): 価格計算ユーティリティのテスト
import { describe, it, expect } from 'vitest'
import type { Sale } from '@/generated/prisma/client'
import { computeUnitPrice, computeVariantBasePrice } from './pricing'

const product = { id: 'p1', price: 1000 }

const makeActiveSale = (salePrice: number): Sale => ({
  id: 's1',
  productId: product.id,
  salePrice,
  startsAt: new Date('2020-01-01'),
  endsAt: new Date('2999-12-31'),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
})

describe('computeVariantBasePrice', () => {
  it('variant が無い場合は商品の基本価格を返す', () => {
    expect(computeVariantBasePrice(product, null)).toBe(1000)
    expect(computeVariantBasePrice(product, undefined)).toBe(1000)
  })

  it('variant の priceDelta を加算する', () => {
    expect(computeVariantBasePrice(product, { priceDelta: 200 })).toBe(1200)
  })

  it('priceDelta が負でも 0 円未満にはならない', () => {
    expect(computeVariantBasePrice(product, { priceDelta: -2000 })).toBe(0)
  })
})

describe('computeUnitPrice', () => {
  it('Sale も variant も無ければ商品価格を返す', () => {
    expect(computeUnitPrice(product, null, null)).toBe(1000)
  })

  it('variant ありで Sale なしなら priceDelta が反映される', () => {
    expect(computeUnitPrice(product, { priceDelta: 300 }, null)).toBe(1300)
  })

  it('Sale 適用中は Sale 価格を優先（variant 差分は無視）', () => {
    const sale = makeActiveSale(700)
    expect(computeUnitPrice(product, { priceDelta: 500 }, sale)).toBe(700)
  })

  it('Sale が無効（salePrice >= price）なら variant 差分が採用される', () => {
    const inactiveSale = makeActiveSale(1500) // salePrice >= price なので effective は 1000
    expect(computeUnitPrice(product, { priceDelta: 200 }, inactiveSale)).toBe(1200)
  })
})
