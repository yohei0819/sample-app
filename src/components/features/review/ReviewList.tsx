// レビュー一覧・平均評価表示コンポーネント（Server Component）
import { findPublicReviewsByProductId, getReviewStatsByProductId } from '@/lib/db/reviews'
import { StarRating } from './StarRating'

type Props = {
  productId: string
}

export const ReviewList = async ({ productId }: Props) => {
  const [reviews, stats] = await Promise.all([
    findPublicReviewsByProductId(productId, { take: 20 }),
    getReviewStatsByProductId(productId),
  ])

  return (
    <section aria-labelledby="reviews-heading" className="space-y-6">
      <h2 id="reviews-heading" className="text-xl font-bold text-gray-900">
        カスタマーレビュー
      </h2>

      {/* 平均評価サマリー */}
      {stats.count > 0 ? (
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
          <span className="text-4xl font-bold text-gray-900">
            {stats.average.toFixed(1)}
          </span>
          <div className="space-y-1">
            <StarRating mode="display" rating={Math.round(stats.average)} size="md" />
            <p className="text-sm text-muted-foreground">{stats.count}件のレビュー</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">まだレビューがありません。</p>
      )}

      {/* レビュー一覧 */}
      {reviews.length > 0 && (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-lg border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StarRating mode="display" rating={review.rating} size="sm" />
                  <span className="text-sm font-medium text-gray-800">
                    {review.user.name ?? '匿名ユーザー'}
                  </span>
                </div>
                <time
                  dateTime={review.createdAt.toISOString()}
                  className="text-xs text-muted-foreground"
                >
                  {review.createdAt.toLocaleDateString('ja-JP')}
                </time>
              </div>
              {review.comment && (
                <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                  {review.comment}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
