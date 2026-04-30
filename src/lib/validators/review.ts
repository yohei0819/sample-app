// 追加 (#132): レビュー入力バリデーション
import { z } from 'zod'
import { MAX_REVIEW_IMAGES } from '@/constants/reviews'

// 設定済み Cloudinary cloud_name のみを許容するためのプレフィックスを返す
// （他人のCloudinaryアカウントを利用したなりすまし URL を弾くため、cloud_name まで含めて検証する）
// バリデーターは Server 側でしか呼ばれないため、process.env を直接参照する
const getAllowedCloudinaryPrefix = (): string => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  if (!cloudName) {
    // 通常運用では env.ts の zod 検証で必須化されているため到達しない。
    // 万一未設定の場合は弾けないため例外を投げる（黙って通すのは危険）
    throw new Error('CLOUDINARY_CLOUD_NAME が未設定です')
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/`
}

// Cloudinary 画像 URL のみ受け付ける（外部 URL や他テナントのなりすまし URL の混入を防止）
const reviewImageUrlSchema = z
  .string()
  .url('画像URLの形式が不正です')
  .refine(
    (url) => url.startsWith(getAllowedCloudinaryPrefix()),
    { message: 'Cloudinary 以外の画像 URL は登録できません' },
  )

export const reviewInputSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, '評価は1以上で入力してください')
    .max(5, '評価は5以下で入力してください'),
  comment: z
    .string()
    .max(1000, 'コメントは1000文字以内で入力してください')
    .optional(),
  images: z
    .array(reviewImageUrlSchema)
    .max(MAX_REVIEW_IMAGES, `画像は最大${MAX_REVIEW_IMAGES}枚まで添付できます`)
    .optional()
    .default([]),
})

export type ReviewInput = z.infer<typeof reviewInputSchema>
