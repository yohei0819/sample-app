// 商品一覧ページ（Server Component）
import { Suspense } from 'react'
import type { Metadata } from 'next'
import type { Prisma } from '@/generated/prisma/client'
import { findProducts } from '@/lib/db/products'
import { findAllCategories } from '@/lib/db/categories' // 変更: DB層のリポジトリ関数を使用
import { ProductList } from '@/components/features/product/ProductList'
import { ProductSearch } from '@/components/features/product/ProductSearch'
import { ProductSort } from '@/components/features/product/ProductSort'
import { ProductFilter } from '@/components/features/product/ProductFilter'

export const metadata: Metadata = {
  title: '商品一覧',
  description: '商品を検索・フィルター・ソートしてお好みの商品を見つけましょう。',
}

// 変更: string[] の可能性を含む正確な型定義（重複クエリパラメータ対応）
type SearchParamValue = string | string[] | undefined

type SearchParams = {
  search?: SearchParamValue
  categoryId?: SearchParamValue
  sort?: SearchParamValue
}

type Props = {
  searchParams: SearchParams
}

// 追加: string[] が渡された場合は最初の要素を取り出す安全なヘルパー
const resolveParam = (value: SearchParamValue): string | undefined => {
  if (Array.isArray(value)) return value[0]
  return value
}

const SORT_ORDER_MAP: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: 'desc' },
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
}

export default async function ProductsPage({ searchParams }: Props) {
  // 変更: resolveParam で string[] を安全に string へ変換してから Prisma へ渡す
  const search = resolveParam(searchParams.search)
  const categoryId = resolveParam(searchParams.categoryId)
  const sort = resolveParam(searchParams.sort) ?? 'newest'
  const orderBy = SORT_ORDER_MAP[sort] ?? { createdAt: 'desc' }

  // カテゴリ一覧とプロダクト一覧を並行取得（エラー時は error.tsx に伝播させる）
  const [products, categories] = await Promise.all([
    findProducts({ search, categoryId, orderBy }),
    findAllCategories(), // 変更: リポジトリ関数経由に変更
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">商品一覧</h1>

      {/* 検索・フィルター・ソートエリア */}
      <div className="mb-6 space-y-3">
        {/* 検索バー */}
        <Suspense fallback={null}>
          <ProductSearch />
        </Suspense>

        {/* フィルター・ソート */}
        <div className="flex flex-wrap items-center gap-3">
          <Suspense fallback={null}>
            <ProductFilter categories={categories} />
          </Suspense>
          <Suspense fallback={null}>
            <ProductSort />
          </Suspense>
        </div>
      </div>

      {/* 件数表示 */}
      <p className="mb-4 text-sm text-gray-500">{products.length}件の商品</p>

      {/* 商品一覧グリッド */}
      <ProductList products={products} />
    </div>
  )
}
