// 商品カードコンポーネント
import Link from 'next/link'
import Image from 'next/image'
import type { Product, Category } from '@/generated/prisma/client'
import { WishlistButton } from '@/components/features/wishlist/WishlistButton' // 追加

type Props = {
  product: Product & { category: Category | null }
  // 追加: ウィッシュリスト状態
  isWishlisted?: boolean
  isLoggedIn?: boolean
}

export const ProductCard = ({ product, isWishlisted = false, isLoggedIn = false }: Props) => {
  const imageUrl = product.images[0] ?? null

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md"
      aria-label={`${product.name}の詳細を見る`}
    >
      {/* 商品画像 */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <span className="text-sm">画像なし</span>
          </div>
        )}
        {/* 在庫切れバッジ */}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-800">
              在庫切れ
            </span>
          </div>
        )}
        {/* 追加: ウィッシュリストボタン（右上に絶対配置） */}
        <div className="absolute right-2 top-2">
          <WishlistButton
            productId={product.id}
            initialIsWishlisted={isWishlisted}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </div>

      {/* 商品情報 */}
      <div className="p-3">
        {product.category && (
          <p className="mb-1 text-xs text-gray-500">{product.category.name}</p>
        )}
        <h2 className="line-clamp-2 text-sm font-medium text-gray-900">{product.name}</h2>
        <p className="mt-1 text-base font-bold text-gray-900">
          ¥{product.price.toLocaleString('ja-JP')}
        </p>
      </div>
    </Link>
  )
}
