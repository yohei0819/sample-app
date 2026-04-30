// 商品詳細表示コンポーネント（Server Component）
import Image from 'next/image'
import type { Sale } from '@/generated/prisma/client'
import type { findProductById } from '@/lib/db/products'
import { getEffectivePrice, isSaleActive, getDiscountPercent } from '@/lib/sale'
import { BackInStockForm } from './BackInStockForm' // 追加: バックインストック通知フォーム
import { ProductPurchasePanel } from './ProductPurchasePanel' // 変更 (#131): variant 対応のカート追加パネル
import type { VariantOption } from './ProductVariantSelector' // 追加 (#131)
import { WishlistButton } from '@/components/features/wishlist/WishlistButton' // 追加

// 変更: ReturnTypeベースの型定義でスキーマ変更に対応
type Props = {
  product: NonNullable<Awaited<ReturnType<typeof findProductById>>>
  // 追加: ウィッシュリスト状態
  wishlistProps: {
    isLoggedIn: boolean
    initialIsWishlisted: boolean
  }
  // 追加 (#107): 適用中のセール
  activeSale?: Sale | null
}

export const ProductDetail = ({ product, wishlistProps, activeSale = null }: Props) => {
  const imageUrl = product.images[0] ?? null
  // 追加 (#107): セール価格と表示制御
  const effectivePrice = getEffectivePrice(product, activeSale)
  const onSale = isSaleActive(activeSale)
  const discountPercent = getDiscountPercent(product, activeSale)

  // 追加 (#131): バリエーション一覧を Client Component 用の形に正規化
  const variantOptions: VariantOption[] = product.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    // attributes は Json なので Record<string, string> に絞り込み（不正な値は除外）
    attributes: Object.fromEntries(
      Object.entries((v.attributes ?? {}) as Record<string, unknown>).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
    ),
    priceDelta: v.priceDelta,
    stock: v.stock,
  }))
  const hasVariants = variantOptions.length > 0
  // バリエーションあり商品は variants の合計在庫で「在庫切れ」表示を判定する
  const displayStock = hasVariants
    ? variantOptions.reduce((sum, v) => sum + v.stock, 0)
    : product.stock

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
            {displayStock === 0 && (
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
          {onSale ? (
            <div className="space-y-1">
              <span className="inline-block rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                SALE {discountPercent}%OFF
              </span>
              <p className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-red-600 sm:text-3xl">
                  ¥{effectivePrice.toLocaleString('ja-JP')}
                </span>
                <span className="text-base text-gray-500 line-through">
                  ¥{product.price.toLocaleString('ja-JP')}
                </span>
                <span className="text-sm font-normal text-gray-500">（税込）</span>
              </p>
            </div>
          ) : (
            <p className="text-2xl font-bold text-gray-900">
              ¥{product.price.toLocaleString('ja-JP')}
              <span className="ml-1 text-sm font-normal text-gray-500">（税込）</span>
            </p>
          )}

          {/* 在庫数 */}
          <p className={`text-sm ${displayStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {hasVariants
              ? displayStock > 0
                ? `在庫あり（合計${displayStock}点）`
                : '在庫切れ'
              : displayStock > 0
                ? `在庫あり（残り${displayStock}点）`
                : '在庫切れ'}
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

          {/* カートに追加・ウィッシュリストボタン */}
          <div className="mt-auto flex items-start gap-3 pt-4">
            <div className="flex-1">
              <ProductPurchasePanel
                productId={product.id}
                productName={product.name}
                productPrice={product.price}
                productImageUrl={imageUrl}
                productStock={product.stock}
                variants={variantOptions}
              />
            </div>
            {/* 追加: ウィッシュリストボタン */}
            <WishlistButton
              productId={product.id}
              initialIsWishlisted={wishlistProps.initialIsWishlisted}
              isLoggedIn={wishlistProps.isLoggedIn}
            />
          </div>

          {/* 追加: 在庫切れ時のみバックインストック通知購読フォームを表示 */}
          {displayStock === 0 && (
            <div className="pt-2">
              <BackInStockForm productId={product.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
