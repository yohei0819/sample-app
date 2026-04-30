// 追加 (#131): カートストアの variant 対応テスト
import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from './cartStore'

const baseItem = {
  id: 'p1',
  name: 'Tシャツ',
  price: 1000,
  imageUrl: null,
}

describe('useCartStore (variant 対応)', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] })
  })

  it('variant が異なる同一商品は別行として保持される', () => {
    const { addItem } = useCartStore.getState()
    addItem({ ...baseItem, variantId: 'v-m', variantLabel: 'size: M', priceDelta: 0 })
    addItem({ ...baseItem, variantId: 'v-l', variantLabel: 'size: L', priceDelta: 200 })

    const items = useCartStore.getState().items
    expect(items).toHaveLength(2)
    expect(items.map((i) => i.variantId).sort()).toEqual(['v-l', 'v-m'])
  })

  it('同じ variant を再度追加すると数量がインクリメントされる', () => {
    const { addItem } = useCartStore.getState()
    addItem({ ...baseItem, variantId: 'v-m' })
    addItem({ ...baseItem, variantId: 'v-m' })

    const items = useCartStore.getState().items
    expect(items).toHaveLength(1)
    expect(items[0]?.quantity).toBe(2)
  })

  it('variantId なしと variantId 指定は別行として扱われる（後方互換）', () => {
    const { addItem } = useCartStore.getState()
    addItem({ ...baseItem }) // variantId 未指定
    addItem({ ...baseItem, variantId: 'v-m' })

    expect(useCartStore.getState().items).toHaveLength(2)
  })

  it('updateQuantity / removeItem は variantId を含めて同一性判定する', () => {
    const { addItem, updateQuantity, removeItem } = useCartStore.getState()
    addItem({ ...baseItem, variantId: 'v-m' })
    addItem({ ...baseItem, variantId: 'v-l' })

    updateQuantity('p1', 5, 'v-m')
    let items = useCartStore.getState().items
    expect(items.find((i) => i.variantId === 'v-m')?.quantity).toBe(5)
    expect(items.find((i) => i.variantId === 'v-l')?.quantity).toBe(1)

    removeItem('p1', 'v-l')
    items = useCartStore.getState().items
    expect(items).toHaveLength(1)
    expect(items[0]?.variantId).toBe('v-m')
  })

  it('totalItems / totalPrice はすべての行を集計する', () => {
    const { addItem } = useCartStore.getState()
    addItem({ ...baseItem, price: 1000, variantId: 'v-m' })
    addItem({ ...baseItem, price: 1200, variantId: 'v-l' })
    addItem({ ...baseItem, price: 1200, variantId: 'v-l' }) // 同じ variant に追加 → quantity 2

    const state = useCartStore.getState()
    expect(state.totalItems()).toBe(3)
    expect(state.totalPrice()).toBe(1000 + 1200 * 2)
  })
})
