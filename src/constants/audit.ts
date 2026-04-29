// 監査ログ関連の定数（#121）
export const AUDIT_ACTIONS = [
  'PRODUCT_CREATE',
  'PRODUCT_UPDATE',
  'PRODUCT_DELETE',
  'STOCK_ADJUST',
  'SALE_CREATE',
  'SALE_UPDATE',
  'SALE_DELETE',
  'ORDER_STATUS_CHANGE',
  'USER_ROLE_CHANGE',
] as const

export type AuditActionLabel = (typeof AUDIT_ACTIONS)[number]
