// 管理画面 商品新規作成ページ（Server Component）
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProductForm } from '@/components/features/admin/ProductForm'
import { findAllCategories } from '@/lib/db/categories'

// 追加: 管理画面はDB必須のため動的レンダリングを強制
export const dynamic = 'force-dynamic'

export const metadata = {
  title: '商品新規作成 | 管理画面',
}

export default async function AdminProductNewPage() {
  const categories = await findAllCategories()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          商品一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">商品新規作成</h1>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <ProductForm categories={categories} />
      </div>
    </div>
  )
}
