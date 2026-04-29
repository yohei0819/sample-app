// 追加 (#103): 関連商品セクション（Server Component）
// 同カテゴリの商品を最大8件表示する
import { findRelatedProducts } from '@/lib/db/products'
import { ProductCard } from '@/components/features/product/ProductCard'
import { RELATED_PRODUCTS_LIMIT } from '@/constants/recommend'

type Props = {
  categoryId: string | null
  excludeId: string
}

export const RelatedProducts = async ({ categoryId, excludeId }: Props) => {
  // カテゴリ未設定の商品は関連商品を表示しない
  if (!categoryId) return null

  const related = await findRelatedProducts({
    categoryId,
    excludeId,
    limit: RELATED_PRODUCTS_LIMIT,
  })

  if (related.length === 0) return null

  return (
    <section aria-labelledby="related-products-heading" className="space-y-4">
      <h2 id="related-products-heading" className="text-xl font-bold">
        関連商品
      </h2>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {related.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}
