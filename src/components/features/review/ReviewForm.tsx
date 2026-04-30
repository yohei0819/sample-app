'use client'
// レビュー投稿フォーム（Client Component）
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { MAX_REVIEW_IMAGES } from '@/constants/reviews'
import { ReviewImageUploader } from './ReviewImageUploader'
import { StarRating } from './StarRating'

// 追加 (#132): 画像配列フィールドを含むフォームスキーマ
const reviewFormSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, '評価を選択してください')
    .max(5),
  comment: z.string().max(1000, 'コメントは1000文字以内で入力してください').optional(),
  images: z
    .array(z.string().url())
    .max(MAX_REVIEW_IMAGES, `画像は最大${MAX_REVIEW_IMAGES}枚まで添付できます`),
})

type ReviewFormValues = z.infer<typeof reviewFormSchema>

type Props = {
  productId: string
  isLoggedIn: boolean
  hasReviewed: boolean
}

export const ReviewForm = ({ productId, isLoggedIn, hasReviewed }: Props) => {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { rating: 0, comment: '', images: [] }, // 変更 (#132)
  })

  if (!isLoggedIn) {
    return (
      <p className="text-sm text-muted-foreground">
        レビューを投稿するには
        {/* 変更: <a> → <Link> でクライアントサイドルーティングに統一 */}
        <Link href="/login" className="underline text-primary ml-1">
          ログイン
        </Link>
        してください。
      </p>
    )
  }

  if (hasReviewed || submitted) {
    return (
      <p className="text-sm text-green-600 font-medium">
        {submitted ? 'レビューを投稿しました。ありがとうございます！' : 'この商品にはすでにレビューを投稿しています。'}
      </p>
    )
  }

  const onSubmit = async (data: ReviewFormValues) => {
    setServerError(null)
    try {
      const res = await fetch(`/api/reviews/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: data.rating,
          comment: data.comment || undefined,
          images: data.images, // 追加 (#132)
        }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        const message =
          typeof json === 'object' && json !== null && 'error' in json
            ? String((json as { error: unknown }).error)
            : 'レビューの投稿に失敗しました'
        setServerError(message)
        return
      }
      setSubmitted(true)
      router.refresh()
    } catch {
      setServerError('ネットワークエラーが発生しました')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 rounded-lg border bg-card p-4">
      <h3 className="text-base font-semibold text-gray-900">レビューを投稿する</h3>

      {/* 星評価 */}
      <div className="space-y-1">
        {/* 変更: htmlFor に対応する id がないため span に変更 */}
        <span className="text-sm font-medium leading-none">評価 <span aria-hidden="true" className="text-destructive">*</span></span>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <StarRating
              mode="input"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.rating && (
          <p className="text-sm text-destructive" role="alert">
            {errors.rating.message}
          </p>
        )}
      </div>

      {/* 画像アップロード（追加 #132） */}
      <Controller
        name="images"
        control={control}
        render={({ field }) => (
          <ReviewImageUploader
            value={field.value ?? []}
            onChange={field.onChange}
            disabled={isSubmitting}
          />
        )}
      />
      {errors.images && (
        <p className="text-sm text-destructive" role="alert">
          {errors.images.message}
        </p>
      )}

      {/* コメント */}
      <div className="space-y-1">
        <Label htmlFor="comment">コメント（任意）</Label>
        <textarea
          id="comment"
          rows={4}
          placeholder="商品の感想を入力してください（1000文字以内）"
          aria-describedby={errors.comment ? 'comment-error' : undefined}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          {...register('comment')}
        />
        {errors.comment && (
          <p id="comment-error" className="text-sm text-destructive" role="alert">
            {errors.comment.message}
          </p>
        )}
      </div>

      {/* サーバーエラー */}
      {serverError && (
        <p className="text-sm text-destructive" role="alert">
          {serverError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? '送信中...' : 'レビューを投稿する'}
      </Button>
    </form>
  )
}
