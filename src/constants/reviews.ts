// 追加 (#132): レビュー機能の定数

// レビューに添付できる画像の最大枚数
export const MAX_REVIEW_IMAGES = 3

// 並び順
export const REVIEW_SORT_ORDERS = ['newest', 'helpful'] as const
export type ReviewSortOrder = (typeof REVIEW_SORT_ORDERS)[number]
export const DEFAULT_REVIEW_SORT: ReviewSortOrder = 'newest'

// エラーコード
export const REVIEW_ERROR_CODE = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  SELF_VOTE_FORBIDDEN: 'SELF_VOTE_FORBIDDEN',
  INTERNAL: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
} as const
export type ReviewErrorCode = (typeof REVIEW_ERROR_CODE)[keyof typeof REVIEW_ERROR_CODE]
