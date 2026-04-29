// 追加 (#103): 最近見た商品ストア（Zustand + localStorage 永続化）
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RECENTLY_VIEWED_LIMIT, RECENTLY_VIEWED_STORAGE_KEY } from '@/constants/recommend'

// 履歴に保存する最低限の情報のみを持つ
export type RecentlyViewedItem = {
  id: string
  name: string
  price: number
  imageUrl: string | null
}

type RecentlyViewedStore = {
  items: RecentlyViewedItem[]
  add: (item: RecentlyViewedItem) => void
  clear: () => void
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],

      // 同一IDがあれば先頭に詰め直し、上限を超えた古い履歴は捨てる
      add: (item) => {
        set((state) => {
          const filtered = state.items.filter((i) => i.id !== item.id)
          return { items: [item, ...filtered].slice(0, RECENTLY_VIEWED_LIMIT) }
        })
      },

      clear: () => set({ items: [] }),
    }),
    { name: RECENTLY_VIEWED_STORAGE_KEY },
  ),
)
