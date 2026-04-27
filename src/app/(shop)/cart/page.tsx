'use client'

// カートページ（Client Component）
import { useEffect, useState } from 'react' // 追加
import { CartEmpty } from '@/components/features/cart/CartEmpty'
import { CartItem } from '@/components/features/cart/CartItem'
import { CartSummary } from '@/components/features/cart/CartSummary'
import { useCartStore } from '@/stores/cartStore'

export default function CartPage() {
  const { items, totalItems, totalPrice } = useCartStore()
  // 変更: SSRハイドレーション不一致を防ぐためマウント後に表示する
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    useCartStore.persist.rehydrate()
    setMounted(true)
  }, [])

  // ハイドレーション前はローディング状態を返す
  if (!mounted) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold tracking-tight">カート</h1>
        <div className="animate-pulse space-y-4" aria-label="読み込み中">
          <div className="h-24 rounded-lg bg-muted" />
          <div className="h-24 rounded-lg bg-muted" />
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold tracking-tight">カート</h1>

      {items.length === 0 ? (
        // カートが空の場合
        <CartEmpty />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* カートアイテム一覧 */}
          <section className="lg:col-span-2" aria-label="カートアイテム一覧">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </section>

          {/* 注文サマリー */}
          <aside aria-label="注文サマリー">
            <CartSummary
              totalItems={totalItems()}
              totalPrice={totalPrice()}
            />
          </aside>
        </div>
      )}
    </main>
  )
}
