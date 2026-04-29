// 追加 (#107): タイムセール新規作成ページ
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { SaleForm } from '@/components/features/admin/SaleForm'
import { findAllProductsForAdmin } from '@/lib/db/products'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'セール新規作成 | 管理画面',
}

export default async function AdminSaleNewPage() {
  const products = await findAllProductsForAdmin({ take: 200 })
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/sales"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          セール一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">セール新規作成</h1>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <SaleForm
          products={products.map((p) => ({ id: p.id, name: p.name, price: p.price }))}
        />
      </div>
    </div>
  )
}
