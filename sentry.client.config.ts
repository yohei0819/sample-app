// Sentry クライアント側初期化（ブラウザで実行）
// NEXT_PUBLIC_SENTRY_DSN が設定されている場合のみ初期化する
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    // 追加: パフォーマンス計測のサンプリング率（必要に応じて調整）
    tracesSampleRate: 0.1,
    // 追加: 個人情報を含む可能性のあるデータをマスク
    sendDefaultPii: false,
  })
}
