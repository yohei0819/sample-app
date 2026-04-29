# my-app

<!-- TODO: プロジェクトの概要を記載してください -->
[プロジェクトの概要をここに記載]

## 技術スタック

<!-- TODO: 使用技術を記載してください -->
| カテゴリ | 技術 |
|---|---|
| フレームワーク | [例: Next.js, React, Vue など] |
| 言語 | [例: TypeScript, JavaScript など] |
| スタイリング | [例: Tailwind CSS, CSS Modules など] |
| データベース | [例: PostgreSQL, MySQL, MongoDB など] |
| その他 | [例: Prisma, Zod, etc.] |

## セットアップ

### 前提条件

- Node.js (推奨バージョン: [バージョンを記載])
- npm / yarn / pnpm

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yohei0819/my-app.git
cd my-app

# 依存関係のインストール
npm install
```

### 環境変数の設定

```bash
# .env.local を作成して環境変数を設定
cp .env.example .env.local
```

`.env.local` を編集して必要な環境変数を設定してください。

<!-- TODO: 必要な環境変数を記載してください -->

### Google OAuth の設定（任意）

Google ログインを有効化する場合：

1. [Google Cloud Console](https://console.cloud.google.com/) で OAuth クライアント ID を作成（種類: ウェブアプリケーション）
2. 承認済みのリダイレクト URI に `${NEXTAUTH_URL}/api/auth/callback/google`（例: `http://localhost:3000/api/auth/callback/google`）を登録
3. `.env.local` に以下を追加

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

未設定の場合は Google ログインボタンが表示されません（パスワード認証のみ）。同一メールアドレスのユーザーが既に存在する場合は自動的に連携されます。

## 使い方

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### ビルド

```bash
npm run build
```

### 本番サーバーの起動

```bash
npm run start
```

## セキュリティポリシー

### セキュリティヘッダー（#122）
全ルートに以下のヘッダーを `next.config.mjs` で付与している。

| ヘッダー | 値 | 目的 |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'` ベース。Stripe・Cloudinary・Sentry・Resend を許可 | XSS / データインジェクション防止 |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | HTTPS 強制 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | リファラー漏洩防止 |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | 不要な権限 API を全拒否 |
| `X-Content-Type-Options` | `nosniff` | MIME スニッフィング防止 |
| `X-Frame-Options` | `DENY` | クリックジャッキング防止 |

CSP の `script-src` には Next.js のインライン runtime と Stripe.js のため `'unsafe-inline'` `'unsafe-eval'` を許容している。将来的には nonce 方式への移行を検討する。

### 脆弱性スキャン
CI では `pnpm audit --audit-level=critical --prod` で critical のみ fail、high は警告表示で継続する。

## ライセンス

<!-- TODO: ライセンスを記載してください -->
[LICENSE を記載]
