// メール送信関連の定数
// 送信元アドレス（実際のドメインは将来環境変数化予定）
export const EMAIL_FROM = 'noreply@example.com'

// メール件名
export const EMAIL_SUBJECTS = {
  ORDER_CONFIRMATION: 'ご注文ありがとうございます',
  SHIPMENT_NOTIFICATION: '商品を発送しました',
} as const
