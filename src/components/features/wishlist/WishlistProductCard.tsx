// ウィッシュリスト一覧用商品カード（Server Component）
import Image from 'next/image'
import Link from 'next/link'
import type { findWishlistByUserId } from '@/lib/db/wishlist'
import { WishlistButton } from './WishlistButton'

// ウィッシュリストのitem型をReturnTypeから派生させる
type WishlistItem = NonNullable<
  Awaited<ReturnType<typeof findWishlistByUserId>>
>['items'][number]

type Props = {
  item: WishlistItem
}

export const WishlistProductCard = ({ item }: Props) => {
  const { product } = item
  const imageUrl = product.images[0] ?? null

  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md">
      {/* ウィッシュリスト削除ボタン（絶対配置） */}
      <div className="absolute right-2 top-2 z-10">
        <WishlistButton
          productId={product.id}
          initialIsWishlisted={true}
          isLoggedIn={true}
        />
      </div>

      <Link
        href={`/products/${product.id}`}
        aria-label={`${product.name}の詳細を見る`}
        className="block"
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
    </div>
  )
}
