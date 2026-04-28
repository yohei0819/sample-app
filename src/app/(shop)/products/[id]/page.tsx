// 商品詳細ページ（Server Component）
import { cache } from 'react' // 追加
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { findProductById } from '@/lib/db/products'
import { findReviewByUserAndProduct } from '@/lib/db/reviews'
import { isProductInWishlist } from '@/lib/db/wishlist' // 追加
import { ProductDetail } from '@/components/features/product/ProductDetail'
import { ReviewForm } from '@/components/features/review/ReviewForm'
import { ReviewList } from '@/components/features/review/ReviewList'

// 追加: React.cacheでラップして1リクエスト内のDBクエリ重複を解消
const getCachedProductById = cache(findProductById)

type Props = {
  params: { id: string }
}

// OGPメタデータ生成
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const product = await getCachedProductById(params.id) // 変更: キャッシュ経由で取得
  if (!product) {
    return { title: '商品が見つかりません' }
  }
  return {
    title: product.name,
    description: product.description ?? `${product.name}の詳細ページです。`,
    openGraph: {
      title: product.name,
      description: product.description ?? `${product.name}の詳細ページです。`,
      ...(product.images[0] ? { images: [{ url: product.images[0] }] } : {}),
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getCachedProductById(params.id) // 変更: キャッシュ経由で取得

  if (!product) {
    notFound()
  }

  // ログイン状態・レビュー済み確認
  const session = await auth()
  const userId = session?.user?.id ?? null
  const [hasReviewed, initialIsWishlisted] = await Promise.all([
    userId ? !!(await findReviewByUserAndProduct(userId, product.id)) : Promise.resolve(false),
    userId ? isProductInWishlist(userId, product.id) : Promise.resolve(false),
  ])

  return (
    <div>
      <ProductDetail
        product={product}
        wishlistProps={{ isLoggedIn: !!userId, initialIsWishlisted }} // 追加
      />
      {/* レビューセクション */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Suspense fallback={<p className="text-sm text-muted-foreground">レビューを読み込み中...</p>}>
          <ReviewList productId={product.id} />
        </Suspense>
        {/* レビュー投稿フォーム */}
        <ReviewForm
          productId={product.id}
          isLoggedIn={!!userId}
          hasReviewed={hasReviewed}
        />
      </div>
    </div>
  )
}
