// 注文履歴一覧ページ（Server Component）
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { findOrdersByUserId } from '@/lib/db/orders'
import { OrderCard } from '@/components/features/orders/OrderCard'

export const metadata: Metadata = {
  title: '注文履歴',
}

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login?redirect=/orders')
  }

  const orders = await findOrdersByUserId(session.user.id)

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">注文履歴</h1>

      {orders.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">まだ注文がありません。</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <OrderCard order={order} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
