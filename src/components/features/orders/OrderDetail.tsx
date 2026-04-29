// 注文詳細コンポーネント
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import type { Order, OrderItem, Product } from '@/generated/prisma/client'
import type { ShippingAddress } from '@/constants/checkout'
import { OrderStatusBadge } from '@/components/features/orders/OrderStatusBadge'
import { OrderTimeline } from '@/components/features/orders/OrderTimeline' // 追加 (#118)
import { ReturnRequestButton } from '@/components/features/orders/ReturnRequestButton' // 追加 (#117)

type OrderItemWithProduct = OrderItem & { product: Product }
type OrderWithItems = Order & { items: OrderItemWithProduct[] }

type Props = {
  order: OrderWithItems
}

export const OrderDetail = ({ order }: Props) => {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const subtotal = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  // TODO: クーポン割引が totalPrice に反映される場合、tax の逆算が不正確になる。クーポン実装時に要修正
  const tax = order.totalPrice - subtotal

  // shippingAddress は Json? 型なのでキャストして扱う
  const shipping = order.shippingAddress as ShippingAddress | null

  // 返品申請可能かどうか（#117）: PAID/SHIPPED/DELIVERED のみ
  const canRequestReturn =
    order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED'

  return (
    <div className="space-y-6">
      {/* 戻るリンク */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        注文履歴に戻る
      </Link>

      {/* ヘッダー */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">注文詳細</h1>
          <p className="text-xs text-muted-foreground font-mono">注文番号：{order.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <time className="text-sm text-muted-foreground" dateTime={order.createdAt.toISOString()}>
            {formattedDate}
          </time>
        </div>
      </div>

      {/* 進捗タイムライン (#118) */}
      <OrderTimeline order={order} />

      {/* 注文商品 */}
      <section aria-labelledby="order-items-heading">
        <h2 id="order-items-heading" className="mb-3 font-semibold">
          注文商品
        </h2>
        <div className="rounded-lg border bg-card divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4">
              {item.product.images[0] ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border bg-muted">
                  <Package size={20} className="text-muted-foreground" aria-hidden="true" />
                </div>
              )}
              <div className="flex flex-1 items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">¥{item.unitPrice.toLocaleString()} × {item.quantity}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold">
                  ¥{(item.unitPrice * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 金額サマリー */}
      <section aria-labelledby="order-total-heading">
        <h2 id="order-total-heading" className="mb-3 font-semibold">
          金額
        </h2>
        <div className="rounded-lg border bg-card p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">小計</span>
            <span>¥{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">消費税（10%）</span>
            <span>¥{tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>合計</span>
            <span>¥{order.totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* 配送先 */}
      {shipping && (
        <section aria-labelledby="order-shipping-heading">
          <h2 id="order-shipping-heading" className="mb-3 font-semibold">
            配送先
          </h2>
          <address className="not-italic rounded-lg border bg-card p-4 text-sm space-y-1">
            <p className="font-medium">{shipping.name}</p>
            <p className="text-muted-foreground">
              〒{shipping.postalCode} {shipping.prefecture}{shipping.city}
            </p>
            <p className="text-muted-foreground">{shipping.addressLine1}</p>
            {shipping.addressLine2 && (
              <p className="text-muted-foreground">{shipping.addressLine2}</p>
            )}
            <p className="text-muted-foreground">TEL: {shipping.phone}</p>
          </address>
        </section>
      )}

      {/* 返品・返金情報 (#117) */}
      {(order.status === 'RETURN_REQUESTED' ||
        order.status === 'RETURNED' ||
        order.status === 'REFUNDED') && (
        <section aria-labelledby="order-return-heading">
          <h2 id="order-return-heading" className="mb-3 font-semibold">
            返品・返金情報
          </h2>
          <div className="rounded-lg border bg-card p-4 text-sm space-y-2">
            {order.returnRequestedAt && (
              <p>
                <span className="text-muted-foreground">申請日:</span>{' '}
                {new Date(order.returnRequestedAt).toLocaleString('ja-JP')}
              </p>
            )}
            {order.returnReason && (
              <p>
                <span className="text-muted-foreground">理由:</span> {order.returnReason}
              </p>
            )}
            {order.refundedAt && order.refundedAmount !== null && (
              <p>
                <span className="text-muted-foreground">返金額:</span> ¥
                {order.refundedAmount.toLocaleString()}（
                {new Date(order.refundedAt).toLocaleString('ja-JP')}）
              </p>
            )}
          </div>
        </section>
      )}

      {/* 返品申請ボタン (#117) */}
      {canRequestReturn && (
        <section aria-labelledby="order-return-action-heading">
          <h2 id="order-return-action-heading" className="sr-only">
            返品申請
          </h2>
          <ReturnRequestButton orderId={order.id} />
        </section>
      )}
    </div>
  )
}
