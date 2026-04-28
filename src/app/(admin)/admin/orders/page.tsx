// 管理画面 注文一覧ページ（Server Component）
import { Suspense } from 'react'
import type { OrderStatus } from '@/generated/prisma/client'
import { countOrders, findOrders } from '@/lib/db/orders'
import { OrderTable } from '@/components/features/admin/OrderTable'
import { ADMIN_ORDER_PAGE_SIZE } from '@/constants/admin'

export const metadata = {
  title: '注文管理 | 管理画面',
}

const VALID_STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']

type SearchParams = {
  status?: string
  page?: string
}

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status: statusParam, page: pageParam } = await searchParams

  const status =
    statusParam && VALID_STATUSES.includes(statusParam as OrderStatus)
      ? (statusParam as OrderStatus)
      : undefined

  const page = Math.max(1, Number(pageParam ?? 1))
  const skip = (page - 1) * ADMIN_ORDER_PAGE_SIZE

  const [orders, total] = await Promise.all([
    findOrders({ status, take: ADMIN_ORDER_PAGE_SIZE, skip }),
    countOrders({ status }),
  ])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">注文管理</h1>
          <p className="text-sm text-muted-foreground">注文の一覧・詳細確認・ステータス変更</p>
        </div>
        {/* 追加: CSV エクスポートボタン (#74) */}
        <a
          href="/api/admin/export/orders"
          className="inline-flex items-center rounded-md border bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent"
          aria-label="注文一覧を CSV ダウンロード"
        >
          CSV ダウンロード
        </a>
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">読み込み中...</p>}>
        <OrderTable
          orders={orders}
          total={total}
          currentPage={page}
          currentStatus={statusParam ?? ''}
        />
      </Suspense>
    </div>
  )
}
