// 管理画面ダッシュボード（Server Component）
import { Suspense } from 'react'
import { DashboardStats } from '@/components/features/admin/DashboardStats'
import { RecentOrders } from '@/components/features/admin/RecentOrders'
import { getDashboardStats, getRecentOrders } from '@/lib/db/stats'

export const metadata = {
  title: 'ダッシュボード | 管理画面',
}

export default async function DashboardPage() {
  const [stats, recentOrders] = await Promise.all([getDashboardStats(), getRecentOrders()])

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-sm text-muted-foreground">売上・注文の概要</p>
      </div>

      {/* 統計カード */}
      <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}>
        <DashboardStats stats={stats} />
      </Suspense>

      {/* 最新注文一覧 */}
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted" />}>
        <RecentOrders orders={recentOrders} />
      </Suspense>
    </div>
  )
}
