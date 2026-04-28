// メール送信関連の定数
// 変更: 送信元アドレスは src/env.ts の EMAIL_FROM を参照（ハードコード解消）

// メール件名
export const EMAIL_SUBJECTS = {
  ORDER_CONFIRMATION: 'ご注文ありがとうございます',
  SHIPMENT_NOTIFICATION: '商品を発送しました',
} as const
