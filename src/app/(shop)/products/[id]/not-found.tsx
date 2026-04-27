// 商品詳細ページ 404UI
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ProductDetailNotFound() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
      <h2 className="mb-4 text-xl font-bold text-gray-900">商品が見つかりません</h2>
      <p className="mb-8 text-sm text-gray-500">
        お探しの商品は存在しないか、すでに削除された可能性があります。
      </p>
      <Button asChild variant="default">
        <Link href="/products">商品一覧に戻る</Link>
      </Button>
    </div>
  )
}
