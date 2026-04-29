// 注文関連の定数
import type { OrderStatus } from '@/generated/prisma/client'

// 注文ステータス表示名
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: '支払い待ち',
  PAID: '支払い済み',
  SHIPPED: '発送済み',
  DELIVERED: '配達済み',
  CANCELLED: 'キャンセル済み',
  // 追加 (#117): 返品・返金
  RETURN_REQUESTED: '返品申請中',
  RETURNED: '返品受付済み',
  REFUNDED: '返金済み',
}

// 注文ステータスバッジカラー（Tailwind クラス）
export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
  // 追加 (#117)
  RETURN_REQUESTED: 'bg-orange-100 text-orange-800',
  RETURNED: 'bg-amber-100 text-amber-800',
  REFUNDED: 'bg-rose-100 text-rose-800',
}

// 注文履歴ページパス
export const ORDERS_PATH = '/orders'
export const ACCOUNT_PATH = '/account'

// 追加: 注文ステータス遷移の妥当性ルール（純粋関数のためサーバー・クライアント双方から利用可能）
// 各キーから遷移可能なステータス一覧を返す
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  // 変更 (#117): PAID/SHIPPED/DELIVERED から RETURN_REQUESTED への遷移を許可
  PAID: ['SHIPPED', 'CANCELLED', 'RETURN_REQUESTED'],
  SHIPPED: ['DELIVERED', 'CANCELLED', 'RETURN_REQUESTED'],
  DELIVERED: ['RETURN_REQUESTED'],
  CANCELLED: [],
  // 追加 (#117): 返品フロー
  RETURN_REQUESTED: ['RETURNED', 'CANCELLED'], // 管理者が承認 → RETURNED、却下 → CANCELLED で履歴に残す
  RETURNED: ['REFUNDED'], // 返金処理完了
  REFUNDED: [],
}

// 追加: 注文ステータス遷移が妥当かを判定する純粋関数
export const canTransitionOrderStatus = (from: OrderStatus, to: OrderStatus): boolean => {
  return ORDER_STATUS_TRANSITIONS[from]?.includes(to) ?? false
}
