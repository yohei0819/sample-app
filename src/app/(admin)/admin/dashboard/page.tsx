// 管理画面ダッシュボード（Server Component）
import { DashboardStats } from '@/components/features/admin/DashboardStats'
import { LowStockWidget } from '@/components/features/admin/LowStockWidget'
import { RecentOrders } from '@/components/features/admin/RecentOrders'
import { getDashboardStats, getRecentOrders } from '@/lib/db/stats'

// 追加: 管理画面はDB必須のため動的レンダリングを強制
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'ダッシュボード | 管理画面',
}

export default async function DashboardPage() {
  const [stats, recentOrders] = await Promise.all([getDashboardStats(), getRecentOrders()])

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
          <p className="text-sm text-muted-foreground">売上・注文の概要</p>
        </div>
        {/* 追加: 売上サマリ CSV ダウンロード (#74) */}
        <div className="flex gap-2">
          <a
            href="/api/admin/export/sales?granularity=daily"
            className="inline-flex items-center rounded-md border bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent"
            aria-label="売上サマリ（日次）を CSV ダウンロード"
          >
            日次CSV
          </a>
          <a
            href="/api/admin/export/sales?granularity=monthly"
            className="inline-flex items-center rounded-md border bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent"
            aria-label="売上サマリ（月次）を CSV ダウンロード"
          >
            月次CSV
          </a>
        </div>
      </div>

      {/* 統計カード */}
      {/* 変更: await済みデータのため Suspense を削除（loading.tsx がルートSuspenseを担当） */}
      <DashboardStats stats={stats} />

      {/* 最新注文一覧 */}
      <RecentOrders orders={recentOrders} />

      {/* 追加 (#106): 在庫アラートウィジェット */}
      <LowStockWidget />
    </div>
  )
}
