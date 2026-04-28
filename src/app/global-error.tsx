'use client'
// Next.js グローバルエラーハンドラ（root layout レベルのエラーをキャッチ）
// Sentry に通知して、最低限のフォールバックUIを表示する
import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // DSN 未設定時は no-op で安全
    Sentry.captureException(error)
    console.error('[global-error]', error)
  }, [error])

  return (
    <html lang="ja">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-2xl font-bold">予期しないエラーが発生しました</h1>
          <p className="text-sm text-muted-foreground">
            ご不便をおかけして申し訳ありません。お時間をおいて再度お試しください。
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            再試行
          </button>
        </div>
      </body>
    </html>
  )
}
