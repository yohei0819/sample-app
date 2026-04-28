'use client'

// ウィッシュリストページ エラー境界
import { useEffect } from 'react'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function WishlistError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[WishlistPage] エラー:', error)
  }, [error])

  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-16 text-center">
      <h2 className="mb-2 text-xl font-bold text-gray-900">
        ウィッシュリストの読み込みに失敗しました
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        しばらくしてから再度お試しください。
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
      >
        再試行する
      </button>
    </div>
  )
}
