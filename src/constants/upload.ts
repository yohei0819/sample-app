// 画像アップロード関連の定数
// 許容する画像 MIME タイプ
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

// 1ファイルあたりの最大バイト数（5MB）
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

// アップロード API のエラーコード
export const UPLOAD_ERROR_CODE = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  NO_FILE: 'NO_FILE',
  INVALID_TYPE: 'INVALID_TYPE',
  TOO_LARGE: 'TOO_LARGE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
} as const

export type UploadErrorCode = (typeof UPLOAD_ERROR_CODE)[keyof typeof UPLOAD_ERROR_CODE]
