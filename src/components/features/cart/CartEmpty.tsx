// カートが空の場合に表示するコンポーネント
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export const CartEmpty = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24">
      <ShoppingCart size={64} className="text-muted-foreground" aria-hidden="true" />
      <p className="text-lg text-muted-foreground">カートに商品がありません</p>
      <Button asChild>
        <Link href="/products">商品を見る</Link>
      </Button>
    </div>
  )
}
