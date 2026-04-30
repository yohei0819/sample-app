// Cloudinary SDK 設定
import 'server-only'
import { v2 as cloudinary } from 'cloudinary'
import { env } from '@/env'

// グローバル設定（モジュール初回読み込み時に1回のみ実行）
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
})

// 追加: アップロード先フォルダ（用途別）
const UPLOAD_FOLDER = 'sample-app/products'
const REVIEW_UPLOAD_FOLDER = 'sample-app/reviews' // 追加 (#132)
export const REVIEW_IMAGE_FOLDER = REVIEW_UPLOAD_FOLDER // 追加 (#132): 外部公開用

// 追加: アップロード結果の型（必要なフィールドのみ）
export type CloudinaryUploadResult = {
  secureUrl: string
  publicId: string
  width: number
  height: number
  format: string
  bytes: number
}

// 追加: バッファ（File から作る Buffer）を Cloudinary にアップロードする
export const uploadImageBuffer = async (
  buffer: Buffer,
  filename?: string,
  folder: string = UPLOAD_FOLDER,
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        // 既定は自動フォーマット最適化（webp/avif等を自動選択）
        format: undefined,
        public_id: filename ? sanitizePublicId(filename) : undefined,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinaryへのアップロードに失敗しました'))
          return
        }
        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        })
      },
    )
    uploadStream.end(buffer)
  })
}

// 追加: ファイル名を public_id に使う場合の安全化
const sanitizePublicId = (filename: string): string => {
  // 拡張子を取り除き、英数字・ハイフン・アンダースコアのみに正規化
  const base = filename.replace(/\.[^.]+$/, '')
  return base.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80)
}
