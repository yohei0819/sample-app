// 管理画面 商品一覧ページ（Server Component）
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ProductTable } from '@/components/features/admin/ProductTable'
import { findAllProductsForAdmin } from '@/lib/db/products'

// 追加: 管理画面はDB必須のため動的レンダリングを強制
export const dynamic = 'force-dynamic'

export const metadata = {
  title: '商品管理 | 管理画面',
}

export default async function AdminProductsPage() {
  const products = await findAllProductsForAdmin()

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">商品管理</h1>
          <p className="text-sm text-muted-foreground">商品の一覧・作成・編集・削除</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} aria-hidden="true" />
          新規作成
        </Link>
      </div>

      <ProductTable products={products} />
    </div>
  )
}
