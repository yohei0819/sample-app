'use client'
// 商品管理 エラーページ
import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminProductsError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[admin/products] エラー:', error)
  }, [error])

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border bg-card p-12 text-center">
        <AlertCircle size={40} className="text-red-500" aria-hidden="true" />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">エラーが発生しました</h2>
          <p className="text-sm text-muted-foreground">商品情報の読み込みに失敗しました。</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          再試行
        </button>
      </div>
    </div>
  )
}
