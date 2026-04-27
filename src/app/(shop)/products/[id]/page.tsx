// 商品詳細ページ（Server Component）
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { findProductById } from '@/lib/db/products'
import { ProductDetail } from '@/components/features/product/ProductDetail'

type Props = {
  params: { id: string }
}

// OGPメタデータ生成
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const product = await findProductById(params.id)
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
  const product = await findProductById(params.id)

  if (!product) {
    notFound()
  }

  return <ProductDetail product={product} />
}
