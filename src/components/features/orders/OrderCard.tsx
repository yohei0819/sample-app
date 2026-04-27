// 注文一覧カードコンポーネント
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Order, OrderItem, Product } from '@/generated/prisma/client'
import { OrderStatusBadge } from '@/components/features/orders/OrderStatusBadge'

type OrderItemWithProduct = OrderItem & { product: Product }
type OrderWithItems = Order & { items: OrderItemWithProduct[] }

type Props = {
  order: OrderWithItems
}

export const OrderCard = ({ order }: Props) => {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Link
      href={`/orders/${order.id}`}
      className="block rounded-lg border bg-card transition-colors hover:bg-accent"
      aria-label={`注文 ${formattedDate}の詳細を見る`}
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <OrderStatusBadge status={order.status} />
              <time className="text-xs text-muted-foreground" dateTime={order.createdAt.toISOString()}>
                {formattedDate}
              </time>
            </div>
            <p className="text-sm text-muted-foreground">
              注文番号：<span className="font-mono text-xs">{order.id}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <p className="font-semibold">¥{order.totalPrice.toLocaleString()}</p>
            <ChevronRight size={16} className="text-muted-foreground" aria-hidden="true" />
          </div>
        </div>

        {/* 商品サムネイル一覧 */}
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="注文商品">
          {order.items.map((item) => (
            <li key={item.id} className="text-xs text-muted-foreground">
              {item.product.name} × {item.quantity}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  )
}
