'use client'

// カートに追加するボタン（Client Component）
// 将来のZustandストア連携を見越したスタブ実装

type Props = {
  productId: string
  stock: number
}

export const AddToCartButton = ({ productId, stock }: Props) => {
  const isOutOfStock = stock === 0

  const handleClick = () => {
    // TODO: Zustandカートストアへの追加処理を実装する
    console.log('Added to cart:', productId)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isOutOfStock}
      aria-label={isOutOfStock ? '在庫切れのため購入できません' : 'カートに追加 する'}
      className={[
        'w-full rounded-lg px-6 py-3 text-base font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isOutOfStock
          ? 'cursor-not-allowed bg-gray-200 text-gray-500'
          : 'bg-gray-900 text-white hover:bg-gray-700 focus-visible:ring-gray-900',
      ].join(' ')}
    >
      {isOutOfStock ? '在庫切れ' : 'カートに追加する'}
    </button>
  )
}
