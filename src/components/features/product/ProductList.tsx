// 商品一覧グリッドコンポーネント
import type { Product, Category, Sale } from '@/generated/prisma/client'
import { ProductCard } from './ProductCard'

type Props = {
  products: (Product & { category: Category | null })[]
  // 追加: ウィッシュリスト状態
  wishlistedProductIds?: Set<string>
  isLoggedIn?: boolean
  // 追加 (#107): 商品ID -> 適用中セールのマップ
  activeSales?: Map<string, Sale>
}

export const ProductList = ({
  products,
  wishlistedProductIds,
  isLoggedIn = false,
  activeSales,
}: Props) => {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">条件に一致する商品が見つかりませんでした。</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isWishlisted={wishlistedProductIds?.has(product.id) ?? false}
          isLoggedIn={isLoggedIn}
          activeSale={activeSales?.get(product.id) ?? null}
        />
      ))}
    </div>
  )
}
