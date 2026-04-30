// レート制限関連の定数
// 1分間の窓
export const RATE_LIMIT_WINDOW_MS = 60_000

// API ごとの上限（1分あたりリクエスト数）
export const RATE_LIMITS = {
  // 認証系：ブルートフォース対策のため厳しめ
  AUTH_REGISTER: 5,
  AUTH_LOGIN: 10,
  // 注文作成：通常利用ではほぼ呼ばれないため低め
  ORDER_CREATE: 10,
  // 決済 PaymentIntent 作成
  PAYMENT_INTENT: 20,
  // 画像アップロード
  ADMIN_UPLOAD: 30,
  // 追加 (#104): 検索サジェスト
  SEARCH_SUGGEST: 60,
  // 追加 (#120): メール確認の再送（5分に1回）
  EMAIL_VERIFY_RESEND: 1,
  // 追加 (#119): カート操作（API）
  CART_OPERATION: 60,
  // 追加 (#129): パスワードリセット要求（5分に1回）
  PASSWORD_RESET_REQUEST: 1,
  // 追加 (#129): パスワードリセット実行（IP 単位、ブルートフォース対策）
  PASSWORD_RESET_CONSUME: 10,
  // 追加 (#132): レビュー画像アップロード（IP 単位）
  REVIEW_IMAGE_UPLOAD: 10,
  // 追加 (#132): レビュー有用性投票
  REVIEW_VOTE: 30,
  // 追加 (#132): レビュー投稿（連投・スパム対策）
  REVIEW_POST: 5,
} as const

export type RateLimitKey = keyof typeof RATE_LIMITS

// 追加 (#120): キーごとに異なるウィンドウを使用したい場合の上書き定義
export const RATE_LIMIT_WINDOW_OVERRIDES: Partial<Record<RateLimitKey, number>> = {
  EMAIL_VERIFY_RESEND: 5 * 60 * 1000, // 5分
  PASSWORD_RESET_REQUEST: 5 * 60 * 1000, // 5分（#129）
}

// レート制限超過時のエラーコード
export const RATE_LIMIT_ERROR_CODE = 'RATE_LIMIT_EXCEEDED'
