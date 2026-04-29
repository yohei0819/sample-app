// 注文進捗タイムライン（#118）
// 注文 → 支払い完了 → 発送 → 配達完了 の進捗を表示する
import { Check, Circle, Package, Truck } from 'lucide-react'
import type { Order } from '@/generated/prisma/client'
import { CARRIER_LABEL, getTrackingUrl, isCarrierCode } from '@/constants/shipping'

type Props = {
  order: Pick<
    Order,
    'status' | 'createdAt' | 'shippedAt' | 'deliveredAt' | 'carrier' | 'trackingNumber'
  >
}

type Step = {
  key: 'ordered' | 'paid' | 'shipped' | 'delivered'
  label: string
  description: string
  icon: typeof Check
  reached: boolean
  date: Date | null
}

const formatDate = (d: Date | null): string | null => {
  if (!d) return null
  return new Date(d).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const OrderTimeline = ({ order }: Props) => {
  const isCancelled = order.status === 'CANCELLED'

  // 各ステップの達成状態
  const reachedPaid = ['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status)
  const reachedShipped = ['SHIPPED', 'DELIVERED'].includes(order.status)
  const reachedDelivered = order.status === 'DELIVERED'

  const steps: Step[] = [
    {
      key: 'ordered',
      label: '注文受付',
      description: 'ご注文を受け付けました',
      icon: Check,
      reached: true,
      date: order.createdAt,
    },
    {
      key: 'paid',
      label: 'お支払い完了',
      description: 'お支払いを確認しました',
      icon: Check,
      reached: reachedPaid,
      date: null,
    },
    {
      key: 'shipped',
      label: '発送済み',
      description: '商品を発送しました',
      icon: Truck,
      reached: reachedShipped,
      date: order.shippedAt,
    },
    {
      key: 'delivered',
      label: '配達完了',
      description: '商品が届きました',
      icon: Package,
      reached: reachedDelivered,
      date: order.deliveredAt,
    },
  ]

  const trackingUrl = getTrackingUrl(order.carrier, order.trackingNumber)
  const carrierLabel = order.carrier && isCarrierCode(order.carrier) ? CARRIER_LABEL[order.carrier] : null

  if (isCancelled) {
    return (
      <section aria-labelledby="order-timeline-heading" className="rounded-lg border bg-card p-4">
        <h2 id="order-timeline-heading" className="mb-2 font-semibold">
          進捗
        </h2>
        <p className="text-sm text-muted-foreground">この注文はキャンセルされました。</p>
      </section>
    )
  }

  return (
    <section aria-labelledby="order-timeline-heading" className="rounded-lg border bg-card p-4">
      <h2 id="order-timeline-heading" className="mb-4 font-semibold">
        進捗
      </h2>
      <ol className="space-y-4">
        {steps.map((step) => {
          const Icon = step.reached ? step.icon : Circle
          const dateStr = formatDate(step.date)
          return (
            <li key={step.key} className="flex items-start gap-3">
              <span
                className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                  step.reached
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-muted-foreground/30 text-muted-foreground'
                }`}
                aria-hidden="true"
              >
                <Icon size={14} />
              </span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${step.reached ? '' : 'text-muted-foreground'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                {dateStr && (
                  <p className="mt-0.5 text-xs text-muted-foreground" suppressHydrationWarning>
                    {dateStr}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {/* 配送追跡情報 */}
      {(carrierLabel || order.trackingNumber) && (
        <div className="mt-4 rounded-md border bg-muted/30 p-3 text-sm">
          <p className="mb-1 font-medium">配送情報</p>
          {carrierLabel && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">配送業者:</span> {carrierLabel}
            </p>
          )}
          {order.trackingNumber && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">追跡番号:</span>{' '}
              <span className="font-mono">{order.trackingNumber}</span>
            </p>
          )}
          {trackingUrl && (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-primary underline-offset-4 hover:underline"
            >
              配送状況を追跡する
            </a>
          )}
        </div>
      )}
    </section>
  )
}
