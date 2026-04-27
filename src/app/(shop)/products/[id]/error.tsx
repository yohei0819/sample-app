'use client'

// 商品詳細ページ エラーUI（Client Component）
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProductDetailError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
      <h2 className="mb-4 text-xl font-bold text-gray-900">エラーが発生しました</h2>
      <p className="mb-8 text-sm text-gray-500">
        商品情報の読み込み中に問題が発生しました。再度お試しください。
      </p>
      <Button type="button" onClick={reset} variant="default">
        再試行する
      </Button>
    </div>
  )
}
