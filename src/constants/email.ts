// メール送信関連の定数
// 変更: 送信元アドレスは src/env.ts の EMAIL_FROM を参照（ハードコード解消）

// メール件名（DBにテンプレートが無い場合のフォールバック）
export const EMAIL_SUBJECTS = {
  ORDER_CONFIRMATION: 'ご注文ありがとうございます',
  SHIPMENT_NOTIFICATION: '商品を発送しました',
  BACK_IN_STOCK: '商品が再入荷しました', // 追加: バックインストック通知
} as const

// 追加: メール通知テンプレートのキー（Prisma enum と一致）
export const EMAIL_TEMPLATE_KEYS = {
  ORDER_CONFIRMATION: 'ORDER_CONFIRMATION',
  SHIPMENT_NOTIFICATION: 'SHIPMENT_NOTIFICATION',
  BACK_IN_STOCK: 'BACK_IN_STOCK',
} as const

export type EmailTemplateKeyValue =
  (typeof EMAIL_TEMPLATE_KEYS)[keyof typeof EMAIL_TEMPLATE_KEYS]

// 追加: 管理画面で表示する日本語ラベル
export const EMAIL_TEMPLATE_LABELS: Record<EmailTemplateKeyValue, string> = {
  ORDER_CONFIRMATION: '注文確認メール',
  SHIPMENT_NOTIFICATION: '発送通知メール',
  BACK_IN_STOCK: '在庫再入荷通知メール',
}

// 追加: 各テンプレートで使用可能な変数（管理画面のヒント表示用）
export const EMAIL_TEMPLATE_VARIABLES: Record<EmailTemplateKeyValue, readonly string[]> = {
  ORDER_CONFIRMATION: ['orderNumber', 'customerName', 'totalAmount', 'itemsHtml'],
  SHIPMENT_NOTIFICATION: ['orderNumber', 'customerName', 'trackingNumber'],
  BACK_IN_STOCK: ['productName', 'productUrl'],
}
