'use client'

// 追加 (#131): 商品詳細ページの variant セレクター + カート追加ボタンの結合 Client Component
// Server Component の ProductDetail から variant 一覧を受け取り、選択状態を管理する。
import { useState } from 'react'
import { AddToCartButton } from './AddToCartButton'
import { ProductVariantSelector, type VariantOption } from './ProductVariantSelector'

type Props = {
  productId: string
  productName: string
  productPrice: number
  productImageUrl: string | null
  productStock: number
  variants: VariantOption[]
}

const formatVariantLabel = (variant: VariantOption | null): string | null => {
  if (!variant) return null
  return Object.entries(variant.attributes)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' / ')
}

export const ProductPurchasePanel = ({
  productId,
  productName,
  productPrice,
  productImageUrl,
  productStock,
  variants,
}: Props) => {
  const hasVariants = variants.length > 0
  const [selectedVariant, setSelectedVariant] = useState<VariantOption | null>(null)

  // バリエーションあり商品の表示用情報
  const displayPrice = hasVariants && selectedVariant
    ? Math.max(0, productPrice + selectedVariant.priceDelta)
    : productPrice
  const displayStock = hasVariants
    ? selectedVariant?.stock ?? variants.reduce((sum, v) => sum + v.stock, 0)
    : productStock
  const variantLabel = formatVariantLabel(selectedVariant)

  return (
    <div className="space-y-3">
      {hasVariants && (
        <ProductVariantSelector variants={variants} onChange={setSelectedVariant} />
      )}

      {hasVariants && (
        <div className="space-y-1 text-sm">
          {selectedVariant ? (
            <>
              <p className="text-gray-700" data-testid="variant-display-price">
                選択中の価格: <span className="font-semibold">¥{displayPrice.toLocaleString('ja-JP')}</span>
              </p>
              <p
                className={selectedVariant.stock > 0 ? 'text-green-600' : 'text-red-500'}
                data-testid="variant-display-stock"
              >
                {selectedVariant.stock > 0
                  ? `在庫あり（残り${selectedVariant.stock}点）`
                  : '在庫切れ'}
              </p>
            </>
          ) : (
            <p className="text-gray-500">バリエーションを選択してください</p>
          )}
        </div>
      )}

      <AddToCartButton
        productId={productId}
        productName={productName}
        productPrice={productPrice}
        productImageUrl={productImageUrl}
        stock={displayStock}
        variantId={selectedVariant?.id ?? null}
        variantLabel={variantLabel}
        variantPriceDelta={selectedVariant?.priceDelta ?? 0}
        requireVariant={hasVariants}
      />
    </div>
  )
}
