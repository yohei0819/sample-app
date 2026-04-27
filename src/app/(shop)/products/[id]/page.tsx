// 商品詳細ページ（Server Component）
import { cache } from 'react' // 追加
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { findProductById } from '@/lib/db/products'
import { ProductDetail } from '@/components/features/product/ProductDetail'

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

  return <ProductDetail product={product} />
}
