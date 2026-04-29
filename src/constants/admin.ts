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
  // 追加 (#117): 返品・返金
  RETURN_REQUESTED: '返品申請中',
  RETURNED: '返品受付済',
  REFUNDED: '返金済',
}

// 注文ステータスのバッジスタイル
export const ORDER_STATUS_CLASS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  // 追加 (#117)
  RETURN_REQUESTED: 'bg-orange-100 text-orange-800',
  RETURNED: 'bg-amber-100 text-amber-800',
  REFUNDED: 'bg-rose-100 text-rose-800',
}

// クーポン一覧ページのページサイズ // 追加
export const ADMIN_COUPON_PAGE_SIZE = 50

// クーポンコードの最大文字数 // 追加
export const COUPON_CODE_MAX_LENGTH = 32

// 追加: ユーザーロール一覧
export const USER_ROLES = ['USER', 'ADMIN'] as const
export type UserRole = (typeof USER_ROLES)[number]

// 追加: ユーザーロールの表示ラベル
export const USER_ROLE_LABEL: Record<UserRole, string> = {
  USER: '一般',
  ADMIN: '管理者',
}

