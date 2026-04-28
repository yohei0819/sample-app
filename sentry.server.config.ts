// Sentry サーバー側初期化（Node.js ランタイム）
// SENTRY_DSN が設定されている場合のみ初期化する
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  })
}
