import 'server-only' // サーバーサイドシークレット保護：クライアントバンドルへの混入を防止
import { z } from 'zod'

// 環境変数のスキーマ定義
const envSchema = z.object({
  // データベース
  DATABASE_URL: z.string().min(1),

  // NextAuth
  NEXTAUTH_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1), // 変更: クライアントサイド参照のためNEXT_PUBLIC_プレフィックスを付与
  STRIPE_WEBHOOK_SECRET: z.string().min(1),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  // Resend（メール送信）
  RESEND_API_KEY: z.string().min(1),
  // 追加: メール送信元アドレス（開発時のデフォルトは Resend のサンドボックス）
  EMAIL_FROM: z.string().min(1).default('onboarding@resend.dev'),

  // アプリ設定
  NEXT_PUBLIC_APP_URL: z.string().min(1),
  NODE_ENV: z.enum(['development', 'test', 'production']).optional().default('development'),

  // 追加: Sentry（オプショナル）
  // DSN未設定時は Sentry を初期化しない
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),

  // 追加 (#105): Google OAuth（オプショナル：未設定時は Google ログインが無効化される）
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
})

// 環境変数をパース・バリデーション
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ 環境変数が不正です:', parsed.error.flatten().fieldErrors)
  throw new Error('環境変数のバリデーションに失敗しました')
}

// 型付き環境変数オブジェクトをエクスポート
export const env = parsed.data
