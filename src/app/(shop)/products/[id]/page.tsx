// 商品詳細ページ（Server Component）
import { cache } from 'react' // 追加
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { findProductById } from '@/lib/db/products'
import { findReviewByUserAndProduct } from '@/lib/db/reviews'
import { getReviewStatsByProductId } from '@/lib/db/reviews' // 追加: aggregateRating用
import { isProductInWishlist } from '@/lib/db/wishlist' // 追加
import { ProductDetail } from '@/components/features/product/ProductDetail'
import { ReviewForm } from '@/components/features/review/ReviewForm'
import { ReviewList } from '@/components/features/review/ReviewList'
import { env } from '@/env' // 追加: 構造化データ用URL生成
import { SITE_NAME, TWITTER_CARD_TYPE } from '@/constants/seo' // 追加
import { safeJsonLd } from '@/lib/seo/jsonLd' // 追加: JSON-LD XSS対策

// 追加: React.cacheでラップして1リクエスト内のDBクエリ重複を解消
const getCachedProductById = cache(findProductById)

type Props = {
  // 変更: Next.js 15 の非同期 params
  params: Promise<{ id: string }>
}

// OGPメタデータ生成
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { id } = await params // 変更
  const product = await getCachedProductById(id) // 変更
  if (!product) {
    return { title: '商品が見つかりません' }
  }
  const description = product.description ?? `${product.name}の詳細ページです。`
  const productUrl = `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/products/${product.id}`
  const images = product.images[0] ? [{ url: product.images[0] }] : undefined

  return {
    title: product.name,
    description,
    openGraph: {
      type: 'website', // 変更: 仕様に合わせて 'website' を指定
      title: product.name,
      description,
      url: productUrl,
      siteName: SITE_NAME,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: TWITTER_CARD_TYPE,
      title: product.name,
      description,
      ...(product.images[0] ? { images: [product.images[0]] } : {}),
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params // 変更: Next.js 15 の非同期 params
  const product = await getCachedProductById(id) // 変更: キャッシュ経由で取得

  if (!product) {
    notFound()
  }

  // 追加: 商品 構造化データ（JSON-LD）
  // 追加: レビュー集計を取得し aggregateRating を埋め込む
  const reviewStats = await getReviewStatsByProductId(product.id)
  const productUrl = `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/products/${product.id}`
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description ?? `${product.name}の詳細ページです。`,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'JPY',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: productUrl,
    },
    // 追加: レビューがある場合のみ aggregateRating を埋め込む
    ...(reviewStats.count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: reviewStats.average.toFixed(1),
            reviewCount: reviewStats.count,
          },
        }
      : {}),
  }

  // 追加: パンくずの構造化データ
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'トップ',
        item: env.NEXT_PUBLIC_APP_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '商品一覧',
        item: `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/products`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
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
      {/* 追加: 商品の構造化データ（JSON-LD） */}
      <script
        type="application/ld+json"
        // 変更: safeJsonLd で '<' をエスケープし XSS / </script> 離脱を防止
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productJsonLd) }}
      />
      {/* 追加: パンくずの構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
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
