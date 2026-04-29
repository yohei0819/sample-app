'use client'
// 管理画面 注文詳細コンポーネント
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from '@/constants/admin'
import { ORDER_STATUS_TRANSITIONS } from '@/constants/orders'
import { ShippingForm } from '@/components/features/admin/ShippingForm' // 追加 (#118)
import type { Coupon, Order, OrderItem, OrderStatus, Product, User } from '@/generated/prisma/client'

// 配送先住所の型定義
type ShippingAddress = {
  name?: string
  postalCode?: string
  prefecture?: string
  city?: string
  line1?: string
  line2?: string
  phone?: string
}

type OrderWithRelations = Order & {
  user: Pick<User, 'id' | 'email' | 'name'>
  items: (OrderItem & { product: Product })[]
  coupon: Coupon | null
}

type Props = {
  order: OrderWithRelations
}

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: '未払い' },
  { value: 'PAID', label: '支払済' },
  { value: 'SHIPPED', label: '発送済' },
  { value: 'DELIVERED', label: '配達完了' },
  { value: 'CANCELLED', label: 'キャンセル' },
]

export const OrderDetail = ({ order }: Props) => {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // 変更: サーバー側と共通の遷移ルール定数を使用（二重定義を解消）
  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status] ?? []

  const handleStatusChange = async (newStatus: OrderStatus) => {
    const label = STATUS_OPTIONS.find((o) => o.value === newStatus)?.label ?? newStatus
    if (!confirm(`ステータスを「${label}」に変更してもよいですか？`)) return

    setIsUpdating(true)
    setErrorMsg(null)

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const data: unknown = await res.json()
        const msg =
          data !== null &&
          typeof data === 'object' &&
          'error' in data &&
          typeof (data as { error: unknown }).error === 'string'
            ? (data as { error: string }).error
            : 'ステータスの更新に失敗しました'
        setErrorMsg(msg)
        return
      }

      router.refresh()
    } catch {
      setErrorMsg('ステータスの更新中にエラーが発生しました')
    } finally {
      setIsUpdating(false)
    }
  }

  const shipping =
    order.shippingAddress !== null && typeof order.shippingAddress === 'object'
      ? (order.shippingAddress as ShippingAddress)
      : null

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* 戻るリンク */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        注文一覧に戻る
      </Link>

      {/* ヘッダー */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">注文詳細</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">ID: {order.id}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
            ORDER_STATUS_CLASS[order.status] ?? 'bg-gray-100 text-gray-800'
          }`}
        >
          {ORDER_STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      {/* ステータス変更 */}
      {nextStatuses.length > 0 && (
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold">ステータスを変更</h2>
          {errorMsg && (
            <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
              {errorMsg}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((s) => {
              const opt = STATUS_OPTIONS.find((o) => o.value === s)
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStatusChange(s)}
                  disabled={isUpdating}
                  className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {opt?.label ?? s}に変更
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 顧客情報 */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">顧客情報</h2>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">名前</dt>
            <dd className="font-medium">{order.user.name ?? '（未設定）'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">メールアドレス</dt>
            <dd className="font-medium">{order.user.email}</dd>
          </div>
        </dl>
      </div>

      {/* 配送先住所 */}
      {shipping && (
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold">配送先住所</h2>
          <address className="not-italic text-sm">
            <p>{shipping.name}</p>
            <p>〒{shipping.postalCode}</p>
            <p>
              {shipping.prefecture}
              {shipping.city}
              {shipping.line1}
              {shipping.line2 ? ` ${shipping.line2}` : ''}
            </p>
            {shipping.phone && <p>Tel: {shipping.phone}</p>}
          </address>
        </div>
      )}

      {/* 追加 (#118): 配送情報フォーム */}
      <ShippingForm
        orderId={order.id}
        initialCarrier={order.carrier}
        initialTrackingNumber={order.trackingNumber}
      />

      {/* 注文商品 */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-4 pb-0">
          <h2 className="text-sm font-semibold">注文商品</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">商品名</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">単価</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">数量</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">小計</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{item.productId.slice(0, 8)}…</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    ¥{item.unitPrice.toLocaleString('ja-JP')}
                  </td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    ¥{(item.unitPrice * item.quantity).toLocaleString('ja-JP')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 合計 */}
        <div className="border-t p-4">
          {order.coupon && (
            <div className="mb-2 flex justify-between text-sm text-muted-foreground">
              <span>クーポン ({order.coupon.code} / {order.coupon.discountPct}%OFF)</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold">
            <span>合計</span>
            <span>¥{order.totalPrice.toLocaleString('ja-JP')}</span>
          </div>
        </div>
      </div>

      {/* 注文メタ情報 */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">注文情報</h2>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">注文日時</dt>
            <dd className="font-medium">
              {new Date(order.createdAt).toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">最終更新</dt>
            <dd className="font-medium">
              {new Date(order.updatedAt).toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </dd>
          </div>
          {order.stripePaymentIntentId && (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Stripe PaymentIntent ID</dt>
              <dd className="font-mono text-xs">{order.stripePaymentIntentId}</dd>
            </div>
          )}
          {order.shippedAt && (
            <div>
              <dt className="text-muted-foreground">発送日時</dt>
              <dd className="font-medium">
                {new Date(order.shippedAt).toLocaleString('ja-JP')}
              </dd>
            </div>
          )}
          {order.deliveredAt && (
            <div>
              <dt className="text-muted-foreground">配達日時</dt>
              <dd className="font-medium">
                {new Date(order.deliveredAt).toLocaleString('ja-JP')}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}
