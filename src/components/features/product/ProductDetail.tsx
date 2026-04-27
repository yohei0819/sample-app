// 商品詳細表示コンポーネント（Server Component）
import Image from 'next/image'
import type { findProductById } from '@/lib/db/products'
import { AddToCartButton } from './AddToCartButton'

// 変更: ReturnTypeベースの型定義でスキーマ変更に嫹応
type Props = {
  product: NonNullable<Awaited<ReturnType<typeof findProductById>>>
}

export const ProductDetail = ({ product }: Props) => {
  const imageUrl = product.images[0] ?? null

  return (
    <div className="container mx-auto px-4 py-8">
      {/* モバイル: 縦積み / デスクトップ: 横並び */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* 商品画像エリア */}
        <div className="w-full lg:w-1/2">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <span className="text-sm">画像なし</span>
              </div>
            )}
            {/* 在庫切れオーバーレイ */}
            {product.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-800">
                  在庫切れ
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 商品情報エリア */}
        <div className="flex w-full flex-col gap-4 lg:w-1/2">
          {/* カテゴリ */}
          {product.category && (
            <p className="text-sm font-medium text-gray-500">{product.category.name}</p>
          )}

          {/* 商品名 */}
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>

          {/* 価格 */}
          <p className="text-2xl font-bold text-gray-900">
            ¥{product.price.toLocaleString('ja-JP')}
            <span className="ml-1 text-sm font-normal text-gray-500">（税込）</span>
          </p>

          {/* 在庫数 */}
          <p className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `在庫あり（残り${product.stock}点）` : '在庫切れ'}
          </p>

          {/* 商品説明 */}
          {product.description && (
            <div className="border-t border-gray-200 pt-4">
              <h2 className="mb-2 text-sm font-semibold text-gray-700">商品説明</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {product.description}
              </p>
            </div>
          )}

          {/* カートに追加ボタン */}
          <div className="mt-auto pt-4">
            <AddToCartButton productId={product.id} stock={product.stock} />
          </div>
        </div>
      </div>
    </div>
  )
}
