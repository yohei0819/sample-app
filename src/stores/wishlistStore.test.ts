// wishlistStore のユニットテスト
import { beforeEach, describe, expect, it } from 'vitest'
import { useWishlistStore } from './wishlistStore'

describe('useWishlistStore', () => {
  beforeEach(() => {
    // 各テスト前に状態をリセット
    useWishlistStore.getState().clear()
  })

  it('初期状態は空である', () => {
    const state = useWishlistStore.getState()
    expect(state.count()).toBe(0)
    expect(state.has('p1')).toBe(false)
  })

  it('setFromServer でサーバー状態を反映できる', () => {
    useWishlistStore.getState().setFromServer(['p1', 'p2', 'p3'])
    const state = useWishlistStore.getState()
    expect(state.count()).toBe(3)
    expect(state.has('p1')).toBe(true)
    expect(state.has('p2')).toBe(true)
    expect(state.has('x')).toBe(false)
  })

  it('add で楽観的に追加できる', () => {
    useWishlistStore.getState().add('p1')
    expect(useWishlistStore.getState().has('p1')).toBe(true)
    expect(useWishlistStore.getState().count()).toBe(1)
  })

  it('add は重複しても件数が増えない（idempotent）', () => {
    const store = useWishlistStore.getState()
    store.add('p1')
    store.add('p1')
    store.add('p1')
    expect(useWishlistStore.getState().count()).toBe(1)
  })

  it('remove で削除できる', () => {
    const store = useWishlistStore.getState()
    store.add('p1')
    store.add('p2')
    store.remove('p1')
    expect(useWishlistStore.getState().has('p1')).toBe(false)
    expect(useWishlistStore.getState().has('p2')).toBe(true)
    expect(useWishlistStore.getState().count()).toBe(1)
  })

  it('存在しないIDの remove は安全に無視される', () => {
    useWishlistStore.getState().remove('not-exist')
    expect(useWishlistStore.getState().count()).toBe(0)
  })

  it('clear で全件削除される', () => {
    const store = useWishlistStore.getState()
    store.setFromServer(['p1', 'p2'])
    store.clear()
    expect(useWishlistStore.getState().count()).toBe(0)
  })

  it('setFromServer は既存状態を上書きする', () => {
    const store = useWishlistStore.getState()
    store.setFromServer(['a', 'b'])
    store.setFromServer(['c'])
    expect(useWishlistStore.getState().has('a')).toBe(false)
    expect(useWishlistStore.getState().has('c')).toBe(true)
    expect(useWishlistStore.getState().count()).toBe(1)
  })

  it('add → remove → add で状態が正しく遷移する', () => {
    const store = useWishlistStore.getState()
    store.add('p1')
    expect(useWishlistStore.getState().has('p1')).toBe(true)
    store.remove('p1')
    expect(useWishlistStore.getState().has('p1')).toBe(false)
    store.add('p1')
    expect(useWishlistStore.getState().has('p1')).toBe(true)
  })
})
