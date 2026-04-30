// 管理画面 商品編集ページ（Server Component）
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProductForm } from '@/components/features/admin/ProductForm'
import { ProductVariantsTab } from '@/components/features/admin/ProductVariantsTab' // 追加 (#131)
import { StockMovementTimeline } from '@/components/features/admin/StockMovementTimeline'
import { findProductByIdForAdmin } from '@/lib/db/products'
import { findAllCategories } from '@/lib/db/categories'
import { findVariantsByProductId } from '@/lib/db/productVariants' // 追加 (#131)

// 追加: 管理画面はDB必須のため動的レンダリングを強制
export const dynamic = 'force-dynamic'

export const metadata = {
  title: '商品編集 | 管理画面',
}

type Props = {
  // 変更: Next.js 15 の非同期 params
  params: Promise<{ id: string }>
}

export default async function AdminProductEditPage({ params }: Props) {
  const { id } = await params // 変更
  const [product, categories, variants] = await Promise.all([
    findProductByIdForAdmin(id),
    findAllCategories(),
    findVariantsByProductId(id), // 追加 (#131)
  ])

  if (!product) {
    notFound()
  }

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
        <h1 className="text-2xl font-bold tracking-tight">商品編集</h1>
        <p className="text-sm text-muted-foreground">{product.name}</p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <ProductForm
          productId={product.id}
          categories={categories}
          defaultValues={{
            name: product.name,
            description: product.description ?? '',
            price: product.price,
            stock: product.stock,
            categoryId: product.categoryId ?? '',
            isPublished: product.isPublished,
            lowStockThreshold: product.lowStockThreshold,
          }}
        />
      </div>

      {/* 追加 (#131): バリエーション CRUD */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <ProductVariantsTab productId={product.id} initialVariants={variants} />
      </div>

      {/* 追加 (#106): 在庫変動履歴タイムライン */}
      <StockMovementTimeline productId={product.id} />
    </div>
  )
}
