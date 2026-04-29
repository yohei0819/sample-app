// 追加 (#103): recentlyViewedStore のユニットテスト
import { beforeEach, describe, expect, it } from 'vitest'
import { useRecentlyViewedStore, type RecentlyViewedItem } from './recentlyViewedStore'

const item = (id: string): RecentlyViewedItem => ({
  id,
  name: `商品${id}`,
  price: 100,
  imageUrl: null,
})

describe('useRecentlyViewedStore', () => {
  beforeEach(() => {
    useRecentlyViewedStore.getState().clear()
  })

  it('初期状態は空である', () => {
    expect(useRecentlyViewedStore.getState().items).toEqual([])
  })

  it('add で先頭に積まれる', () => {
    const { add } = useRecentlyViewedStore.getState()
    add(item('a'))
    add(item('b'))
    expect(useRecentlyViewedStore.getState().items.map((i) => i.id)).toEqual(['b', 'a'])
  })

  it('同一IDは重複せず先頭に詰め直される', () => {
    const { add } = useRecentlyViewedStore.getState()
    add(item('a'))
    add(item('b'))
    add(item('a'))
    expect(useRecentlyViewedStore.getState().items.map((i) => i.id)).toEqual(['a', 'b'])
  })

  it('上限（10件）を超える分は古いものから捨てられる', () => {
    const { add } = useRecentlyViewedStore.getState()
    for (let i = 0; i < 12; i++) {
      add(item(`p${i}`))
    }
    const ids = useRecentlyViewedStore.getState().items.map((i) => i.id)
    expect(ids.length).toBe(10)
    expect(ids[0]).toBe('p11')
    expect(ids[ids.length - 1]).toBe('p2')
  })

  it('clear で全件削除される', () => {
    const { add, clear } = useRecentlyViewedStore.getState()
    add(item('a'))
    clear()
    expect(useRecentlyViewedStore.getState().items).toEqual([])
  })
})
