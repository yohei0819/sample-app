// カート合計サマリーコンポーネント
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

// 消費税率（10%）
const TAX_RATE = 0.1

type Props = {
  totalItems: number
  totalPrice: number
}

export const CartSummary = ({ totalItems, totalPrice }: Props) => {
  // 税込み合計金額
  const tax = Math.floor(totalPrice * TAX_RATE)
  const totalWithTax = totalPrice + tax

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">注文サマリー</h2>

      <div className="flex flex-col gap-3 text-sm">
        {/* 商品点数 */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">商品点数</span>
          <span>{totalItems}点</span>
        </div>

        {/* 小計 */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">小計（税抜）</span>
          <span>¥{totalPrice.toLocaleString()}</span>
        </div>

        {/* 消費税 */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">消費税（10%）</span>
          <span>¥{tax.toLocaleString()}</span>
        </div>

        <Separator />

        {/* 合計 */}
        <div className="flex justify-between font-semibold text-base">
          <span>合計（税込）</span>
          <span>¥{totalWithTax.toLocaleString()}</span>
        </div>
      </div>

      {/* レジに進むボタン（チェックアウト未実装のため disabled） */}
      <Button asChild className="mt-6 w-full" disabled>
        <Link href="/checkout">レジに進む</Link>
      </Button>

      <p className="mt-2 text-center text-xs text-muted-foreground">
        ※チェックアウト機能は近日公開予定です
      </p>
    </div>
  )
}
