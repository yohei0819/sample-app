// 追加 (#107): タイムセール管理一覧ページ
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { SaleTable } from '@/components/features/admin/SaleTable'
import { findAllSales } from '@/lib/db/sales'

// 管理画面はDB必須のため動的レンダリングを強制
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'タイムセール管理 | 管理画面',
}

export default async function AdminSalesPage() {
  const sales = await findAllSales()

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">タイムセール管理</h1>
          <p className="text-sm text-muted-foreground">期間限定割引の作成・編集・削除</p>
        </div>
        <Link
          href="/admin/sales/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} aria-hidden="true" />
          新規作成
        </Link>
      </div>

      <SaleTable sales={sales} />
    </div>
  )
}
