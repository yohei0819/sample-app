// 注文関連の定数
import type { OrderStatus } from '@/generated/prisma/client'

// 注文ステータス表示名
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: '支払い待ち',
  PAID: '支払い済み',
  SHIPPED: '発送済み',
  DELIVERED: '配達済み',
  CANCELLED: 'キャンセル済み',
}

// 注文ステータスバッジカラー（Tailwind クラス）
export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
}

// 注文履歴ページパス
export const ORDERS_PATH = '/orders'
export const ACCOUNT_PATH = '/account'
