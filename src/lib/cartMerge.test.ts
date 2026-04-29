// computeMergedCart のユニットテスト（#119）
import { describe, it, expect } from 'vitest'
import { computeMergedCart } from '@/lib/cartMerge'

describe('computeMergedCart', () => {
  it('サーバーカートのみの場合はそのまま返す', () => {
    const result = computeMergedCart(
      [{ productId: 'p1', quantity: 2 }],
      [],
      new Map([['p1', 10]]),
    )
    expect(result).toEqual([{ productId: 'p1', quantity: 2 }])
  })

  it('ローカルカートのみの場合は在庫上限でクランプして返す', () => {
    const result = computeMergedCart(
      [],
      [{ productId: 'p1', quantity: 5 }],
      new Map([['p1', 3]]),
    )
    expect(result).toEqual([{ productId: 'p1', quantity: 3 }])
  })

  it('競合時は数量を合算する', () => {
    const result = computeMergedCart(
      [{ productId: 'p1', quantity: 2 }],
      [{ productId: 'p1', quantity: 3 }],
      new Map([['p1', 10]]),
    )
    expect(result).toEqual([{ productId: 'p1', quantity: 5 }])
  })

  it('合算後に在庫を超える場合は在庫上限でクランプする', () => {
    const result = computeMergedCart(
      [{ productId: 'p1', quantity: 2 }],
      [{ productId: 'p1', quantity: 5 }],
      new Map([['p1', 4]]),
    )
    expect(result).toEqual([{ productId: 'p1', quantity: 4 }])
  })

  it('在庫が0または商品が存在しないローカルアイテムは除外する', () => {
    const result = computeMergedCart(
      [],
      [
        { productId: 'p1', quantity: 2 }, // 在庫なし
        { productId: 'p2', quantity: 1 }, // 商品なし
        { productId: 'p3', quantity: 3 }, // OK
      ],
      new Map([
        ['p1', 0],
        ['p3', 5],
      ]),
    )
    expect(result).toEqual([{ productId: 'p3', quantity: 3 }])
  })

  it('quantity が 0 以下のローカルアイテムは無視する', () => {
    const result = computeMergedCart(
      [{ productId: 'p1', quantity: 2 }],
      [{ productId: 'p1', quantity: 0 }],
      new Map([['p1', 10]]),
    )
    expect(result).toEqual([{ productId: 'p1', quantity: 2 }])
  })

  it('複数商品を独立にマージする', () => {
    const result = computeMergedCart(
      [{ productId: 'p1', quantity: 1 }],
      [
        { productId: 'p1', quantity: 2 },
        { productId: 'p2', quantity: 1 },
      ],
      new Map([
        ['p1', 10],
        ['p2', 10],
      ]),
    )
    expect(result).toContainEqual({ productId: 'p1', quantity: 3 })
    expect(result).toContainEqual({ productId: 'p2', quantity: 1 })
    expect(result).toHaveLength(2)
  })
})
