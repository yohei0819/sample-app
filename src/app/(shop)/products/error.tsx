'use client'
// 商品一覧 エラーUI
import { useEffect } from 'react'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProductsError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-xl font-bold text-gray-900">商品の読み込みに失敗しました</h2>
      <p className="mt-2 text-sm text-gray-600">しばらく経ってから再度お試しください。</p>
      <button
        onClick={reset}
        className="mt-6 rounded-md bg-gray-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
      >
        再試行
      </button>
    </div>
  )
}
