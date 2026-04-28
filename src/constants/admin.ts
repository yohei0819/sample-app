// 管理画面関連定数

// 注文一覧ページのページサイズ
export const ADMIN_ORDER_PAGE_SIZE = 20

// 在庫少ない判定の閾値（この数以下を「残りわずか」と表示）
export const STOCK_LOW_THRESHOLD = 5

// レビュー一覧ページのページサイズ
export const ADMIN_REVIEW_PAGE_SIZE = 20

// 注文ステータスの表示ラベル
export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: '未払い',
  PAID: '支払済',
  SHIPPED: '発送済',
  DELIVERED: '配達完了',
  CANCELLED: 'キャンセル',
}

// 注文ステータスのバッジスタイル
export const ORDER_STATUS_CLASS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}
