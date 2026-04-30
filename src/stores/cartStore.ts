// カートの状態管理ストア（Zustand + localStorage永続化）
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CART_STORAGE_KEY } from '@/constants/cart' // 追加

// カートアイテムの型
// 変更 (#131): 商品バリエーション（variantId / variantLabel / priceDelta）に対応
export type CartItem = {
  id: string
  name: string
  price: number
  imageUrl: string | null
  quantity: number
  // 追加 (#131): バリエーション情報（任意・後方互換のため optional）
  variantId?: string | null
  variantLabel?: string | null
  priceDelta?: number
}

// 追加 (#131): 同一性キー（id + variantId）
const itemKey = (id: string, variantId?: string | null) =>
  `${id}::${variantId ?? ''}`

// カートストアの型
type CartStore = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string, variantId?: string | null) => void
  updateQuantity: (id: string, quantity: number, variantId?: string | null) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // アイテム追加（既存アイテムは数量+1）
      // 変更 (#131): variantId を含めた同一性で判定
      addItem: (item) => {
        const targetVariant = item.variantId ?? null
        set((state) => {
          const existing = state.items.find(
            (i) => i.id === item.id && (i.variantId ?? null) === targetVariant,
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && (i.variantId ?? null) === targetVariant
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        })
      },

      // アイテム削除
      // 変更 (#131): variantId を含めた同一性で判定
      removeItem: (id, variantId = null) => {
        const target = variantId ?? null
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.id === id && (i.variantId ?? null) === target),
          ),
        }))
      },

      // 数量更新（0以下の場合は削除）
      // 変更 (#131): variantId を含めた同一性で判定
      updateQuantity: (id, quantity, variantId = null) => {
        const target = variantId ?? null
        if (quantity <= 0) {
          get().removeItem(id, target)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && (i.variantId ?? null) === target ? { ...i, quantity } : i,
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
        // 変更: 直接ミューテーションではなく setState 経由で更新
        const validItems = Array.isArray(state.items)
          ? state.items.filter(
              (item) =>
                typeof item.id === 'string' &&
                typeof item.name === 'string' &&
                typeof item.price === 'number' &&
                typeof item.quantity === 'number' &&
                item.quantity > 0
            )
          : []
        useCartStore.setState({ items: validItems })
      },
    }
  )
)

// 追加 (#131): 同一性キー生成のエクスポート（将来の重複検証等で使用）
export { itemKey as cartItemKey }
