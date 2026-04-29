// 商品一覧ページ（Server Component）
import { Suspense } from 'react'
import type { Metadata } from 'next'
import type { Prisma } from '@/generated/prisma/client'
import { auth } from '@/lib/auth' // 追加
import { findProducts } from '@/lib/db/products'
import { findAllCategories } from '@/lib/db/categories' // 変更: DB層のリポジトリ関数を使用
import { findWishlistedProductIds } from '@/lib/db/wishlist' // 追加
import { ProductList } from '@/components/features/product/ProductList'
import { ProductSearch } from '@/components/features/product/ProductSearch'
import { ProductSort } from '@/components/features/product/ProductSort'
import { ProductFilter } from '@/components/features/product/ProductFilter'
import { ProductPriceFilter } from '@/components/features/product/ProductPriceFilter' // 追加 (#104)
import { ProductStockFilter } from '@/components/features/product/ProductStockFilter' // 追加 (#104)
import { PRICE_RANGE_MAX } from '@/constants/search' // 追加 (#104)

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
  // 追加 (#104)
  minPrice?: SearchParamValue
  maxPrice?: SearchParamValue
  inStockOnly?: SearchParamValue
}

type Props = {
  // 変更: Next.js 15 の非同期 searchParams
  searchParams: Promise<SearchParams>
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
  // 追加 (#104): 注文された数（OrderItem 件数）の多い順
  popular: { orderItems: { _count: 'desc' } },
}

// 追加 (#104): 価格パラメータの数値変換ヘルパー（範囲外は無視）
const parsePrice = (value: string | undefined): number | undefined => {
  if (!value) return undefined
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0 || n > PRICE_RANGE_MAX) return undefined
  return Math.floor(n)
}

export default async function ProductsPage({ searchParams }: Props) {
  // 変更: Next.js 15 では searchParams が Promise になる
  const sp = await searchParams
  // 変更: resolveParam で string[] を安全に string へ変換してから Prisma へ渡す
  const search = resolveParam(sp.search)
  const categoryId = resolveParam(sp.categoryId)
  const sort = resolveParam(sp.sort) ?? 'newest'
  const orderBy = SORT_ORDER_MAP[sort] ?? { createdAt: 'desc' }
  // 追加 (#104): 価格レンジ・在庫フィルター
  const minPrice = parsePrice(resolveParam(sp.minPrice))
  const maxPrice = parsePrice(resolveParam(sp.maxPrice))
  const inStockOnly = resolveParam(sp.inStockOnly) === '1'

  // 追加: セッション取得（ウィッシュリスト状態取得のため）
  const session = await auth()
  const userId = session?.user?.id ?? null

  // カテゴリ一覧・プロダクト一覧・ウィッシュリスト状態を並行取得
  const [products, categories, wishlistedProductIds] = await Promise.all([
    findProducts({ search, categoryId, orderBy, minPrice, maxPrice, inStockOnly }),
    findAllCategories(), // 変更: リポジトリ関数経由に変更
    userId ? findWishlistedProductIds(userId) : Promise.resolve(new Set<string>()), // 追加
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
            <ProductPriceFilter />
          </Suspense>
          <Suspense fallback={null}>
            <ProductStockFilter />
          </Suspense>
          <Suspense fallback={null}>
            <ProductSort />
          </Suspense>
        </div>
      </div>

      {/* 件数表示 */}
      <p className="mb-4 text-sm text-gray-500">{products.length}件の商品</p>

      {/* 商品一覧グリッド */}
      <ProductList
        products={products}
        wishlistedProductIds={wishlistedProductIds} // 追加
        isLoggedIn={!!userId} // 追加
      />
    </div>
  )
}
