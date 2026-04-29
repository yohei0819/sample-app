// ウィッシュリストの軽量クライアントキャッシュ（Zustand）
// 既存実装はサーバー側状態 + router.refresh() を主軸とするが、
// 商品一覧やヘッダーバッジでの即時反映用に productId セットだけをクライアントに持つ。
import { create } from 'zustand'

// 追加: ウィッシュリストストアの型
type WishlistStore = {
  // 追加: 現在ウィッシュリストに入っている productId の集合
  productIds: Set<string>
  // 追加: サーバーから取得した productId 配列で内部状態を上書き
  setFromServer: (productIds: readonly string[]) => void
  // 追加: 楽観的に追加
  add: (productId: string) => void
  // 追加: 楽観的に削除
  remove: (productId: string) => void
  // 追加: ウィッシュリスト判定
  has: (productId: string) => boolean
  // 追加: 件数取得
  count: () => number
  // 追加: クリア（ログアウト時など）
  clear: () => void
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  productIds: new Set<string>(),

  setFromServer: (productIds) => {
    set({ productIds: new Set(productIds) })
  },

  add: (productId) => {
    set((state) => {
      if (state.productIds.has(productId)) return state
      const next = new Set(state.productIds)
      next.add(productId)
      return { productIds: next }
    })
  },

  remove: (productId) => {
    set((state) => {
      if (!state.productIds.has(productId)) return state
      const next = new Set(state.productIds)
      next.delete(productId)
      return { productIds: next }
    })
  },

  has: (productId) => get().productIds.has(productId),

  count: () => get().productIds.size,

  clear: () => {
    set({ productIds: new Set<string>() })
  },
}))
