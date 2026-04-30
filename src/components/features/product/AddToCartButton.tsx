'use client'

// カートに追加するボタン（Client Component）
// 変更 (#131): Zustand カートストアと variant 選択に対応
import { useEffect, useState } from 'react'
import { useCartStore } from '@/stores/cartStore'

type Props = {
  productId: string
  productName: string
  productPrice: number
  productImageUrl: string | null
  stock: number
  // 追加 (#131): 選択中バリエーション（バリエーションあり商品でのみ渡す）
  variantId?: string | null
  variantLabel?: string | null
  variantPriceDelta?: number
  // 追加 (#131): バリエーションあり商品で variant 未選択の場合は disabled 化する
  requireVariant?: boolean
}

export const AddToCartButton = ({
  productId,
  productName,
  productPrice,
  productImageUrl,
  stock,
  variantId = null,
  variantLabel = null,
  variantPriceDelta = 0,
  requireVariant = false,
}: Props) => {
  const addItem = useCartStore((s) => s.addItem)
  const [feedback, setFeedback] = useState<string | null>(null)

  // SSR とクライアントで store の hydration 状態が違うため、マウント後に有効化
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const isOutOfStock = stock === 0
  const needsVariant = requireVariant && !variantId
  const disabled = isOutOfStock || needsVariant || !mounted

  const handleClick = () => {
    addItem({
      id: productId,
      name: productName,
      price: productPrice + variantPriceDelta,
      imageUrl: productImageUrl,
      variantId,
      variantLabel,
      priceDelta: variantPriceDelta,
    })
    setFeedback('カートに追加しました')
    window.setTimeout(() => setFeedback(null), 2000)
  }

  const label = isOutOfStock
    ? '在庫切れ'
    : needsVariant
      ? 'バリエーションを選択してください'
      : 'カートに追加する'

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={
          isOutOfStock
            ? '在庫切れのため購入できません'
            : needsVariant
              ? 'バリエーションを選択してからカートに追加してください'
              : 'カートに追加する'
        }
        className={[
          'w-full rounded-lg px-6 py-3 text-base font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          disabled
            ? 'cursor-not-allowed bg-gray-200 text-gray-500'
            : 'bg-gray-900 text-white hover:bg-gray-700 focus-visible:ring-gray-900',
        ].join(' ')}
      >
        {label}
      </button>
      {feedback && (
        <p role="status" aria-live="polite" className="text-sm text-green-600">
          {feedback}
        </p>
      )}
    </div>
  )
}

