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
} as const

export type RateLimitKey = keyof typeof RATE_LIMITS

// レート制限超過時のエラーコード
export const RATE_LIMIT_ERROR_CODE = 'RATE_LIMIT_EXCEEDED'
