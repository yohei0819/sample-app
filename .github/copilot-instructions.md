# メインエージェント定義（オーケストレーター）

## プロジェクト概要
Next.js製のフルスタックECサイト。
購入者向けストアフロント（商品一覧・詳細・カート・決済フロー）と
管理者向け管理画面（商品・注文・在庫管理）を一つのリポジトリで管理する。
UI/UXを重視したデザインと、機能追加しやすいフィーチャーベースのアーキテクチャを採用。

### 主要機能
#### ストアフロント
- 商品一覧（カテゴリ・検索・フィルター・ソート）
- 商品詳細ページ
- 商品レビュー・評価（星評価・コメント投稿）
- カート（Zustandによるクライアント状態管理）
- ウィッシュリスト
- クーポン・割引コード適用
- チェックアウト・決済フロー（Stripe連携）
- 注文履歴・マイページ
- メール通知（注文確認・発送通知）
- 在庫切れ通知
- 認証（ログイン・会員登録）

#### 管理画面（/admin 以下）
- ダッシュボード（売上・注文サマリー）
- 商品管理（CRUD・画像アップロード）
- 注文管理（ステータス変更・詳細確認）
- カテゴリ・在庫管理
- ユーザー管理
- クーポン管理（発行・有効期限・割引率設定）
- レビュー管理（公開/非公開切り替え・削除）
- メール通知テンプレート管理

## 技術スタック

### フロントエンド
| 用途 | ライブラリ / バージョン |
|---|---|
| フレームワーク | Next.js 14（App Router） |
| 言語 | TypeScript 5 |
| スタイリング | Tailwind CSS v3 |
| UIコンポーネント | shadcn/ui |
| アイコン | lucide-react |
| カート状態管理 | Zustand |
| フォームバリデーション | React Hook Form + Zod |

### バックエンド / データ
| 用途 | ライブラリ / バージョン |
|---|---|
| API | Next.js Route Handlers（app/api/） |
| ORM | Prisma |
| DB | PostgreSQL |
| 認証 | NextAuth.js v5（Auth.js） |
| 決済 | Stripe（stripe-js + stripe-node） |
| 画像ストレージ | Cloudinary（or Vercel Blob） |
| メール送信 | Resend（or SendGrid） |

### 開発・インフラ
| 用途 | ツール |
|---|---|
| パッケージ管理 | pnpm |
| Linter/Formatter | ESLint + Prettier |
| テスト | Vitest（Unit）/ Playwright（E2E） |
| デプロイ | Vercel |

### ディレクトリ構成
```
src/
  app/
    (shop)/          # ストアフロント（購入者向け）
      page.tsx       # トップ・商品一覧
      products/      # 商品詳細・レビュー
      cart/          # カート
      checkout/      # チェックアウト・決済
      orders/        # 注文履歴
      wishlist/      # ウィッシュリスト
    (admin)/         # 管理画面（要管理者権限）
      dashboard/
      products/
      orders/
      categories/
      coupons/       # クーポン管理
      reviews/       # レビュー管理
    api/             # Route Handlers
      auth/
      products/
      orders/
      stripe/
      reviews/       # 商品レビュー
      wishlist/      # ウィッシュリスト
      coupons/       # クーポン
      notifications/ # メール通知
  components/
    ui/              # shadcn/ui ベースの汎用コンポーネント
    features/        # 機能別コンポーネント（product/cart/checkout/admin/review/wishlist）
    layouts/         # ヘッダー・フッター・サイドバー
  hooks/             # カスタムフック
  lib/               # Prismaクライアント・Stripe設定・ユーティリティ
    db/              # Prismaリポジトリ関数
    email/           # メール送信（Resend等）
  stores/            # Zustandストア（cart・wishlist など）
  types/             # 型定義
  constants/         # 定数（ページパス・ステータス値など）
  env.ts             # 環境変数バリデーション（Zod）
prisma/
  schema.prisma
public/
e2e/               # Playwright E2Eテスト
```

## MCP連携設定
- GitHub MCP：Issue・PR・ブランチ操作に使用
- Playwright MCP：動作確認・E2Eテスト・証跡記録に使用

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## サブエージェント呼び出しルール
キーワードではなく「ユーザーの意図」で判断する。
判断が曖昧な場合は実行前に確認する（推測で起動しない）。
ルーティングテーブルは上から順に評価し、最初にマッチした行を適用する。

| ユーザーの意図 | 判定条件（例） | 呼び出すエージェント |
|---|---|---|
| 緊急バグ（最優先） | 「hotfix」「緊急」が含まれる | docs/agents/hotfix.md |
| 新機能・新規実装 | 「〇〇を実装して」「新しく〇〇を作成して」「〇〇機能を追加して」 | implement.prompt.md |
| エラー・バグ修正 | 「エラーが出た」「バグがある」「動かない」「〇〇が失敗する」「直して」「修正して」※「緊急」なしの場合 | debug.prompt.md |
| コードレビュー | 「レビューして」「問題ないか見て」「チェックして」 | review.prompt.md |
| テスト作成 | 「テストを書いて」「specを作って」「テストを追加して」 | test.prompt.md |
| リリース作業 | 「リリースして」「本番に反映して」「デプロイして」 | release.prompt.md |
| リファクタリング | 「リファクタリングして」「コードを整理して」「コードをきれいにして」「〇〇を改善して」 | implement.prompt.md |
| ドキュメント更新 | 「ドキュメントを更新して」「READMEを更新して」「コメントを追加して」 | implement.prompt.md |
| スプリント開始 | 「スプリント開始」「sprint-start」「sprint start」 | docs/agents/sprint-start.md |
| スプリント終了 | 「スプリント終了」「sprint-end」「sprint end」 | docs/agents/sprint-end.md |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## エージェント間のオーケストレーションルール

### 重要な原則
このファイル（copilot-instructions.md）が通常フローにおける唯一のオーケストレーターである。
review.prompt.md・debug.prompt.md・test.prompt.md・implement.prompt.md は
他のエージェントを自分で呼び出さない。
各エージェントは「作業して報告する」だけ。
次のアクションは必ずこのファイルが決定する。

※通常フローエージェント（implement/debug/review/test/release）は他エージェントを呼び出さない。
※複合エージェント（docs/agents/以下）の扱い：
  - docs/agents/hotfix.md：例外。Phase1〜5内でdebug.prompt.mdを呼び出すことを許可する
  - docs/agents/sprint-start.md：通常ルールに従う。GitHub MCPのみ使用し他エージェントを呼び出さない
  - docs/agents/sprint-end.md：通常ルールに従う。GitHub MCPのみ使用し他エージェントを呼び出さない
  いずれのエージェントの起動自体もこのファイルが行う。

### 通常フロー（implement完了後）

```
【フロー概要】
事前確認(PR作成)
  → Step1: review【初回レビュー】
  → Step2: 結果判定
       OK(問題なし/P2のみ) → Approve確認 → 完了
       NG(P0/P1あり)      → Step3: debug(1回目)
                          → Step4: review【再レビュー:debug後1回目】
                          → Step5: 結果判定
                               OK → Approve確認 → 完了
                               NG → Step6: debug(2回目)
                                  → Step7: review【再レビュー:debug後2回目(最終)】
                                  → Step8: 結果判定
                                       OK → Approve確認 → 完了
                                       NG → 手動対応依頼・停止
```

事前確認：GitHub MCPでPRが未作成の場合は、reviewを呼び出す前にPRを作成する
          ※PRが既に存在する場合はこの手順をスキップする
Step1: reviewを呼び出す（「【初回レビュー】」と明示する）
Step2: reviewの報告を受け取る
       → 「問題なし」または「P2のみ」の場合：
            私に「Approveしてよいですか？」と確認する（自動Approve禁止）
            【「はい」の場合】GitHub MCPでPRをApproveする
            【「いいえ」の場合】作業を停止して私の次の指示を待つ
       → 「P0またはP1あり」の場合：Step3へ進む

Step3: debugを呼び出す（debug呼び出し：1回目 / 上限2回）
Step4: reviewを呼び出す（「【再レビュー：debug後1回目】」と明示する）
Step5: reviewの報告を受け取る
       → 「問題なし」または「P2のみ」の場合：
            私に「Approveしてよいですか？」と確認する（自動Approve禁止）
            【「はい」の場合】GitHub MCPでPRをApproveする
            【「いいえ」の場合】作業を停止して私の次の指示を待つ
       → 「P0またはP1あり」の場合：Step6へ進む

Step6: debugを呼び出す（debug呼び出し：2回目 / 上限2回）
Step7: reviewを呼び出す（「【再レビュー：debug後2回目（最終）】」と明示する）
Step8: reviewの報告を受け取る
       → 「問題なし」または「P2のみ」の場合：
            私に「Approveしてよいですか？」と確認する（自動Approve禁止）
            【「はい」の場合】GitHub MCPでPRをApproveする
            【「いいえ」の場合】作業を停止して私の次の指示を待つ
       → 「P0またはP1あり」の場合：
            自動進行を停止して以下を出力する：
            「debugの上限（2回）に達しました。
             以下の問題が未解決です：[問題の内容]
             手動での確認をお願いします。」

### test完了後のフロー
test完了 → GitHub MCPでPRが未作成の場合はPRを作成する
          ※PRが既に存在する場合はスキップする
          → reviewを「【初回レビュー】」として呼び出す
          → 以降は通常フローのStep2から続ける

### test失敗後のフロー
test失敗（一部テストが不合格）の報告を受け取る
→ 私に以下を確認する：
  「以下のテストが失敗しました：[失敗内容]
   実装に戻って修正しますか？（はい/いいえ）」
→ 「はい」の場合：implement.prompt.mdを呼び出して修正を依頼する
              修正後はtest.prompt.mdを呼び出してテストを再実行する
              ※この「implement修正→test再実行」サイクルは最大1回まで
              【再実行成功の場合】
                test完了後のフローに合流する
                （PR未作成の場合はPR作成 → reviewを「【初回レビュー】」で呼び出す）
              【再実行失敗の場合】
                「テストが2回失敗しました：[内容]
                 手動での確認をお願いします。」と報告して停止する
→ 「いいえ」の場合：作業を停止する

### release完了後のフロー
release.prompt.mdのStep4が完了して停止した後（デプロイ手順案内の有無を問わず）：
→ このオーケストレーターは追加のエージェントを自動起動しない
→ 以降の判断（デプロイ実行・検証・次のタスク開始など）は全て私が行う
※release.prompt.mdのStep4が停止の責任を持つ。このルールはその後の追加処理防止が目的

### sprint-start完了後のフロー
sprint-start.md Phase4の完了報告を受け取る：
→ このオーケストレーターは追加のエージェントを自動起動しない
→ 次のアクション（各IssueのImplement開始など）は私が決定する

### sprint-end完了後のフロー
sprint-end.md Phase4が完了して停止した後：
→ このオーケストレーターは追加のエージェントを自動起動しない
→ 以降の判断（次スプリント開始・リリース作業など）は全て私が行う

### implement内の修正とオーケストレーションの関係
implement.prompt.mdがPhase3実行中に動作確認エラーを修正する場合は
「実装中の一時的な修正」であり、
上記のレビューループカウンター（最大2回）とは完全に独立している。
この修正はimplement.prompt.md内で完結し、debug.prompt.mdを呼び出さない。

### implement停止報告を受けた場合
implement.prompt.mdから「[Step番号]で問題が発生しました」という報告を受け取る
→ 私に以下を確認する：
  「implementのStep[番号]で自力解決できない問題が発生しました：[問題内容]
   debug.prompt.mdを呼び出して解決を試みますか？（はい/いいえ）」
→ 「はい」の場合：debug.prompt.mdを呼び出す
              ※このdebugはレビューループカウンターとは独立した別カウント
              ※「implement停止→debug→再開」サイクルの上限カウントはオーケストレーター（このファイル）が管理する
              【debug成功の場合】
                「debug解決済み。修正内容：[内容]。
                 Step[番号]の実装を再開してください（Turn1スキップ）」と伝えて
                 implement.prompt.mdをStep[番号]から再開する
                implement完了後の次フローは呼び出し元の文脈に従う：
                【通常フローからの実装だった場合】
                  「通常フロー（implement完了後）」の
                  事前確認（PR作成）から始めてStep1（review「【初回レビュー】」）へ進む
                【test失敗後フローからのimplement修正だった場合】
                  「test失敗後のフロー」のtest再実行ステップに戻る
                  （PR未作成の場合はPR作成 → test.prompt.mdを呼び出してテストを再実行する）
                ※implement途中で再び停止した場合は「implement停止報告を受けた場合」を再度適用する
                  ただしこの「implement停止→debug→再開」サイクルは累計最大2回まで（オーケストレーターがカウント）
                  2回を超えた場合（3回目の停止報告）は：
                  「implementが3回停止しました。手動での対応をお願いします。」と報告して停止する
              【debug失敗（5回上限到達）の場合】
                「implement Step[番号]の問題がdebugでも解決できませんでした：[内容]
                 手動での確認をお願いします。」と報告して停止する
→ 「いいえ」の場合：作業を停止する

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 自律行動ルール

### 確認なしで自律実行してよいこと
- 既存ファイルの読み込み・検索・分析
- 既存ファイルへのコードの追記・修正
- Playwright MCPでの動作確認・スクリーンショット撮影
- テストの実行

### 必ず私に確認すること（自律実行の禁止事項）
- 新規ファイルの作成（内容を提示して承認を得る）
- 既存ファイルの削除
- 外部ライブラリの追加
- 本番環境に影響する変更
- PRのマージ

### エラー発生時の対応（オーケストレーション層のみ適用）
オーケストレーション実行中（MCP操作・エージェント呼び出し時など）に
予期しないエラーが発生した場合はdebug.prompt.mdを呼び出して対応する。
試行回数の管理はdebug.prompt.mdに委ねる（上限5回）。
このdebugはレビューループカウンター（上限2回）とは独立した別カウントである。
debug失敗（5回上限到達）の場合：
  「オーケストレーション中にエラーが解決できませんでした：[エラー内容]
   手動での確認をお願いします。」と報告して停止する。
※implement.prompt.mdからの「Step[番号]で問題が発生しました」という
  明示的な停止報告はこのルールの対象外である。
  その場合は「implement停止報告を受けた場合」を適用する（人間への確認が必要）。
※implement.prompt.md Phase3内のエラーはimplement.prompt.md自身が
  自力で対応する。この規則はPhase3内のエラーには適用しない。

## コーディング規則

### 基本ルール
- コメントは日本語
- `any`型禁止（`unknown`で受けてtype guardで絞る）
- マジックナンバー・マジック文字列は`src/constants/`に定数として切り出す
- `console.log`はコミットに含めない（`console.error`はOK）

### TypeScript
- `interface`よりも`type`を優先して使用する
- `export default`禁止・`export const`で名前付きエクスポートを統一する
- Server Componentとしてデータ取得、Client Componentとしてインタラクションを分離する
- Server Componentに`"use client"`を付けない。必要な最小単位のみClient Componentにする

### コンポーネント設計
- `components/ui/`：ロジックを持たない純粋な表示コンポーネント（shadcn/ui拡張）
- `components/features/`：ドメインロジックを持つ機能コンポーネント（product・cart・checkout・admin・review・wishlistで分割）
- Propsの型は同ファイル内で`type Props = {...}`として定義する
- コンポーネントのファイル名はPascalCase（`ProductCard.tsx`）

### データ取得・更新
- データ取得はServer ComponentまたはRoute Handlerで行う
- フォーム送信はReact Hook Form + Zodでバリデーション後にServer Actionまたはfetchで送信
- API ResponseはZodスキーマで型安全に parse する
- Prismaクエリは`src/lib/db/`以下のリポジトリ関数に集約する

### スタイリング
- スタイルはTailwind CSSのみ使用（インラインstyleは原則禁止）
- レスポンシブはモバイルファーストで`sm:` `md:` `lg:`を使用
- カラー・スペーシングはTailwindのデザイントークンを使用（直接の16進数カラー禁止）
- アニメーションはTailwindの`transition-*`・`animate-*`クラスを使用する

### セキュリティ
- 管理画面の全ルートに管理者ロールチェックを必ず実装する
- StripeのWebhookはシークレット検証を必ず実施する
- 環境変数はすべて`src/env.ts`（zod-env等）で検証・型付けする
- SQLインジェクション対策はPrismaに委ねる（生クエリ使用禁止）

### 拡張性・設計方針
- 新機能は`components/features/[機能名]/`配下に独立したモジュールとして追加する
- 共通ロジックは`hooks/`または`lib/`に切り出す（コンポーネントに書かない）
- 将来的なマイクロサービス分離を想定し、APIレイヤー（`app/api/`）とDBレイヤー（`lib/db/`）を明確に分離する

### エラーハンドリング
- `error.tsx` を各ルートセグメントに配置する（`app/(shop)/error.tsx`・`app/(admin)/error.tsx`）
- `loading.tsx` でSuspense境界を明示し、ストリーミングを活用する
- `not-found.tsx` で404ページをカスタマイズする
- APIエラーレスポンスは`{ error: string; code?: string }`形式に統一する
- フォームのサーバーエラーはZodの`ZodError`で型安全に扱い、フィールド単位でメッセージを表示する

### パフォーマンス
- 画像は必ず`next/image`を使用する（`<img>`タグ禁止）
- データフェッチはServer Componentで行い、クライアントへのデータ伝播を最小化する
- 重いコンポーネントは`next/dynamic`でコード分割する（`ssr: false`はClient Onlyコンポーネントのみ）
- `Suspense`を活用してFallback UIを表示し、Streamingでページ表示を高速化する
- `React.memo`はボトルネックが計測で確認されてから使用する（早期最適化禁止）

### アクセシビリティ（a11y）
- インタラクティブ要素には必ず`aria-label`または可視テキストを付与する
- フォームの`<input>`には`<label>`を関連付ける（`htmlFor`を使用）
- キーボード操作（Tab・Enter・Esc）を全インタラクティブ要素でサポートする
- カラーコントラスト比はWCAG AA基準（4.5:1以上）を満たす
- `role`属性は意味のある要素にのみ使用し、乱用しない

### テスト規則
- **Unit（Vitest）**：`hooks/`・`lib/`・`stores/`・ユーティリティ関数を対象とする
- **Integration（Vitest）**：Route Handler・Server Actionの入出力を対象とする
- **E2E（Playwright）**：以下の主要フローを必ずカバーする
  - 商品一覧 → 商品詳細 → カート追加 → チェックアウト → 注文完了
  - ログイン・ログアウト・会員登録
  - 管理画面ログイン → 商品CRUD操作
- テストファイルは対象ファイルと同階層に`*.test.ts(x)`で配置する（コロケーション）
- E2Eテストは`e2e/`ディレクトリ直下に配置する
- `describe`・`it`・`test`の説明は日本語で記述する

## Git運用規則

### ブランチ命名規則
| プレフィックス | 用途 | 例 |
|---|---|---|
| `feature/` | 新機能追加 | `feature/product-review` |
| `fix/` | 通常のバグ修正 | `fix/cart-quantity-reset` |
| `hotfix/` | 本番緊急修正 | `hotfix/payment-failure` |
| `refactor/` | リファクタリング | `refactor/checkout-flow` |
| `chore/` | 設定・依存関係の更新 | `chore/update-dependencies` |

### コミットメッセージ規則（Conventional Commits準拠）
フォーマット：`<type>(<scope>): <subject>`

| type | 用途 |
|---|---|
| `feat` | 新機能追加 |
| `fix` | バグ修正 |
| `refactor` | リファクタリング（機能変更なし） |
| `style` | フォーマット変更（ロジック変更なし） |
| `test` | テストの追加・修正 |
| `docs` | ドキュメントのみの変更 |
| `chore` | ビルド・設定ファイルの変更 |
| `perf` | パフォーマンス改善 |

- scopeは変更対象のモジュール名（例：`product`・`cart`・`auth`・`admin`）
- subjectは日本語で記述・命令形（例：`feat(cart): カート数量変更機能を追加`）
- `console.log`を含むコミット禁止（コーディング規則と整合）

## 出力ルール
- ファイルパスをコードブロック前に明記
- 修正箇所に `// 変更` コメントを入れる
- 新規追加箇所に `// 追加` コメントを入れる
- 説明はコードの後にまとめる
