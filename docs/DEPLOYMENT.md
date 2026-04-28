# 本番デプロイガイド（Vercel）

## 環境変数チェックリスト

Vercel ダッシュボードで以下を **Production / Preview / Development** ごとに設定する。

### 必須

| 変数名 | 用途 | 例 |
|---|---|---|
| `DATABASE_URL` | PostgreSQL 接続文字列 | `postgresql://user:pass@host:5432/db?schema=public&sslmode=require` |
| `NEXTAUTH_URL` | デプロイ先URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | NextAuth セッション署名 | `openssl rand -base64 32` で生成 |
| `STRIPE_SECRET_KEY` | Stripe シークレット | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 公開キー | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook署名シークレット | `whsec_...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary | - |
| `CLOUDINARY_API_KEY` | Cloudinary | - |
| `CLOUDINARY_API_SECRET` | Cloudinary | - |
| `RESEND_API_KEY` | Resend API キー | `re_...` |
| `EMAIL_FROM` | メール送信元 | `noreply@your-domain.com` |
| `NEXT_PUBLIC_APP_URL` | 公開URL（sitemap等） | `https://your-app.vercel.app` |

### 任意（Sentry）

| 変数名 | 用途 |
|---|---|
| `SENTRY_DSN` | サーバーサイド DSN |
| `NEXT_PUBLIC_SENTRY_DSN` | クライアントサイド DSN |
| `SENTRY_ENVIRONMENT` | `production` / `staging` |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | SourceMap アップロード時のみ |

## デプロイ前チェック

1. `pnpm install` が成功する
2. `pnpm prisma generate` が成功する
3. `pnpm lint` がエラー0
4. `npx tsc --noEmit` がエラー0
5. `pnpm test` が全件通過
6. `pnpm build` が成功する（Vercel側で実行）

## Stripe Webhook 設定

1. Stripe Dashboard → Developers → Webhooks
2. エンドポイント追加: `https://your-app.vercel.app/api/stripe/webhook`
3. イベント: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. 取得した signing secret を `STRIPE_WEBHOOK_SECRET` に設定

## Cloudinary 設定

1. Cloudinary Dashboard で API キーを取得
2. アップロードフォルダ: `sample-app/products`（コード側で固定）

## 初回デプロイ後の確認

- `/api/health` 等でアプリ起動確認（または `/`）
- Prisma Migrate: 初回のみ `pnpm prisma migrate deploy` を Vercel 環境で実行
