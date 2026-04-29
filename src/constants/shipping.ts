// 配送関連の定数（#118）
// クライアント・サーバー双方から参照可能（Prisma 依存なし）

// 配送業者コード
export const CARRIER_CODES = ['yamato', 'sagawa', 'japanpost'] as const
export type CarrierCode = (typeof CARRIER_CODES)[number]

// 配送業者の表示ラベル
export const CARRIER_LABEL: Record<CarrierCode, string> = {
  yamato: 'ヤマト運輸',
  sagawa: '佐川急便',
  japanpost: '日本郵便',
}

// 追跡番号から配送業者の追跡ページ URL を組み立てる
const CARRIER_TRACKING_URL: Record<CarrierCode, (n: string) => string> = {
  yamato: (n) => `https://toi.kuronekoyamato.co.jp/cgi-bin/tneko?number01=${encodeURIComponent(n)}`,
  sagawa: (n) => `https://k2k.sagawa-exp.co.jp/p/sagawa/web/okurijoinput.jsp?okurijoNo=${encodeURIComponent(n)}`,
  japanpost: (n) => `https://trackings.post.japanpost.jp/services/srv/search/?reqCodeNo1=${encodeURIComponent(n)}`,
}

// 型ガード: 文字列が CarrierCode かどうか
export const isCarrierCode = (v: unknown): v is CarrierCode =>
  typeof v === 'string' && (CARRIER_CODES as readonly string[]).includes(v)

// 配送業者・追跡番号から追跡 URL を取得
export const getTrackingUrl = (carrier: string | null | undefined, trackingNumber: string | null | undefined): string | null => {
  if (!carrier || !trackingNumber || !isCarrierCode(carrier)) return null
  return CARRIER_TRACKING_URL[carrier](trackingNumber)
}
