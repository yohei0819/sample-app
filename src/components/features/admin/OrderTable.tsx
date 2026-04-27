'use client'
// 管理画面 注文一覧テーブルコンポーネント
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ADMIN_ORDER_PAGE_SIZE, ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from '@/constants/admin'
import type { Order, OrderItem, Product, User } from '@/generated/prisma/client'

type OrderWithRelations = Order & {
  user: Pick<User, 'id' | 'email' | 'name'>
  items: (OrderItem & { product: Product })[]
}

type Props = {
  orders: OrderWithRelations[]
  total: number
  currentPage: number
  currentStatus: string
}

const STATUS_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: 'PENDING', label: '未払い' },
  { value: 'PAID', label: '支払済' },
  { value: 'SHIPPED', label: '発送済' },
  { value: 'DELIVERED', label: '配達完了' },
  { value: 'CANCELLED', label: 'キャンセル' },
]

export const OrderTable = ({ orders, total, currentPage, currentStatus }: Props) => {
  const router = useRouter()

  const totalPages = Math.ceil(total / ADMIN_ORDER_PAGE_SIZE)

  const buildUrl = (page: number, status: string) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (page > 1) params.set('page', String(page))
    const query = params.toString()
    return `/admin/orders${query ? `?${query}` : ''}`
  }

  const handleStatusChange = (status: string) => {
    router.push(buildUrl(1, status))
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        {/* ステータスフィルター */}
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleStatusChange(opt.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                currentStatus === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          注文がまだありません。
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ステータスフィルター */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleStatusChange(opt.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              currentStatus === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 件数表示 */}
      <p className="text-sm text-muted-foreground">
        全 {total} 件中 {(currentPage - 1) * ADMIN_ORDER_PAGE_SIZE + 1}〜
        {Math.min(currentPage * ADMIN_ORDER_PAGE_SIZE, total)} 件を表示
      </p>

      {/* テーブル */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">注文ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">顧客</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">金額</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">ステータス</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">注文日時</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {order.id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.user.name ?? '（名前未設定）'}</p>
                    <p className="text-xs text-muted-foreground">{order.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    ¥{order.totalPrice.toLocaleString('ja-JP')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ORDER_STATUS_CLASS[order.status] ?? 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {ORDER_STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="rounded px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={buildUrl(currentPage - 1, currentStatus)}
            aria-label="前のページ"
            aria-disabled={currentPage <= 1}
            className={`inline-flex items-center rounded p-1.5 transition-colors ${
              currentPage <= 1
                ? 'pointer-events-none text-muted-foreground/40'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </Link>
          <span className="text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Link
            href={buildUrl(currentPage + 1, currentStatus)}
            aria-label="次のページ"
            aria-disabled={currentPage >= totalPages}
            className={`inline-flex items-center rounded p-1.5 transition-colors ${
              currentPage >= totalPages
                ? 'pointer-events-none text-muted-foreground/40'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  )
}
