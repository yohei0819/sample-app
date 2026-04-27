'use client'

// カートページ（Client Component）
import { CartEmpty } from '@/components/features/cart/CartEmpty'
import { CartItem } from '@/components/features/cart/CartItem'
import { CartSummary } from '@/components/features/cart/CartSummary'
import { useCartStore } from '@/stores/cartStore'

export default function CartPage() {
  const { items, totalItems, totalPrice } = useCartStore()

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
