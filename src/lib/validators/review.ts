// 追加 (#132): レビュー入力バリデーション
import { z } from 'zod'
import { MAX_REVIEW_IMAGES } from '@/constants/reviews'

// Cloudinary 画像 URL のみ受け付ける（外部 URL の混入を防止）
const reviewImageUrlSchema = z
  .string()
  .url('画像URLの形式が不正です')
  .refine(
    (url) => url.startsWith('https://res.cloudinary.com/'),
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
