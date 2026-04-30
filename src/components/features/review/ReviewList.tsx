// レビュー一覧・平均評価表示コンポーネント（Server Component）
import {
  DEFAULT_REVIEW_SORT,
  REVIEW_SORT_ORDERS,
  type ReviewSortOrder,
} from '@/constants/reviews'
import { auth } from '@/lib/auth'
import {
  findPublicReviewsByProductId,
  findVotedReviewIdsByUser,
  getReviewStatsByProductId,
} from '@/lib/db/reviews'
import { ReviewItem } from './ReviewItem'
import { ReviewSortSelect } from './ReviewSortSelect'
import { StarRating } from './StarRating'

type Props = {
  productId: string
  // 変更 (#132): URL クエリからのソート指定（ない場合は newest）
  sort?: string
}

export const ReviewList = async ({ productId, sort: rawSort }: Props) => {
  // 変更 (#132): クエリ → 安全な ReviewSortOrder へ
  const sort: ReviewSortOrder = (REVIEW_SORT_ORDERS as readonly string[]).includes(
    rawSort ?? '',
  )
    ? (rawSort as ReviewSortOrder)
    : DEFAULT_REVIEW_SORT

  const [reviews, stats, session] = await Promise.all([
    findPublicReviewsByProductId(productId, { take: 20, sort }),
    getReviewStatsByProductId(productId),
    auth(),
  ])

  // 追加 (#132): 自分が投票済みのレビューID
  const userId = session?.user?.id ?? null
  const votedSet = userId
    ? await findVotedReviewIdsByUser(
        userId,
        reviews.map((r) => r.id),
      )
    : new Set<string>()

  return (
    <section aria-labelledby="reviews-heading" className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 id="reviews-heading" className="text-xl font-bold text-gray-900">
          カスタマーレビュー
        </h2>
        {reviews.length > 0 && <ReviewSortSelect current={sort} />}
      </div>

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
            <ReviewItem
              key={review.id}
              reviewId={review.id}
              rating={review.rating}
              userName={review.user.name}
              comment={review.comment}
              images={review.images}
              createdAt={review.createdAt.toISOString()}
              helpfulCount={review._count.votes}
              initiallyVoted={votedSet.has(review.id)}
              canVote={!!userId}
              isOwn={userId === review.userId}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
