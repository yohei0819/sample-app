// カートの状態管理ストア（Zustand + localStorage永続化）
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CART_STORAGE_KEY } from '@/constants/cart' // 追加

// カートアイテムの型
export type CartItem = {
  id: string
  name: string
  price: number
  imageUrl: string | null
  quantity: number
}

// カートストアの型
type CartStore = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // アイテム追加（既存アイテムは数量+1）
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        })
      },

      // アイテム削除
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }))
      },

      // 数量更新（0以下の場合は削除）
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }))
      },

      // カートをクリア
      clearCart: () => {
        set({ items: [] })
      },

      // 合計個数
      totalItems: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      // 合計金額
      totalPrice: () => {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      },
    }),
    {
      // localStorageのキー名
      name: CART_STORAGE_KEY, // 変更: 定数化
      // 変更: SSRハイドレーション不一致を防ぐため手動ハイドレーションに切り替え
      skipHydration: true,
      // 追加: localStorageから復元したデータのバリデーション
      onRehydrateStorage: () => (state) => {
        if (!state) return
        // items が配列でない場合はリセット
        if (!Array.isArray(state.items)) {
          state.items = []
        }
        // 各アイテムの必須フィールドを検証
        state.items = state.items.filter(
          (item) =>
            typeof item.id === 'string' &&
            typeof item.name === 'string' &&
            typeof item.price === 'number' &&
            typeof item.quantity === 'number' &&
            item.quantity > 0
        )
      },
    }
  )
)
