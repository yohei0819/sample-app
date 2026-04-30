'use client' // 追加

// カートアイテムコンポーネント
import { Minus, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { type CartItem as CartItemType, useCartStore } from '@/stores/cartStore'

type Props = {
  item: CartItemType
}

// カートアイテムのデフォルト画像サイズ
const CART_IMAGE_SIZE = 96

export const CartItem = ({ item }: Props) => {
  const { updateQuantity, removeItem } = useCartStore()

  return (
    <div className="flex items-center gap-4 border-b py-4">
      {/* 商品画像 */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={CART_IMAGE_SIZE}
            height={CART_IMAGE_SIZE}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
            No Image
          </div>
        )}
      </div>

      {/* 商品情報 */}
      <div className="flex flex-1 flex-col gap-2">
        <p className="font-medium leading-tight">{item.name}</p>
        {/* 追加 (#131): バリエーション情報を表示 */}
        {item.variantLabel && (
          <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
        )}
        <p className="text-sm text-muted-foreground">
          ¥{item.price.toLocaleString()}
        </p>

        {/* 数量変更 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId ?? null)}
            aria-label={`${item.name}の数量を減らす`}
          >
            <Minus size={14} />
          </Button>
          <span className="w-8 text-center text-sm font-medium" aria-label="数量">
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId ?? null)}
            aria-label={`${item.name}の数量を増やす`}
          >
            <Plus size={14} />
          </Button>
        </div>
      </div>

      {/* 小計・削除 */}
      <div className="flex flex-col items-end gap-2">
        <p className="font-semibold">
          ¥{(item.price * item.quantity).toLocaleString()}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => removeItem(item.id, item.variantId ?? null)}
          aria-label={`${item.name}をカートから削除`}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  )
}
