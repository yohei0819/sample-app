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
  STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  // Resend（メール送信）
  RESEND_API_KEY: z.string().min(1),

  // アプリ設定
  NEXT_PUBLIC_APP_URL: z.string().min(1),
  NODE_ENV: z.enum(['development', 'test', 'production']).optional().default('development'),
})

// 環境変数をパース・バリデーション
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ 環境変数が不正です:', parsed.error.flatten().fieldErrors)
  throw new Error('環境変数のバリデーションに失敗しました')
}

// 型付き環境変数オブジェクトをエクスポート
export const env = parsed.data
