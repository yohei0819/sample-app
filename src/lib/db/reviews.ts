import type { ReviewSortOrder } from '@/constants/reviews'
import { prisma } from '@/lib/db/prisma'

// 公開レビュー一覧取得（商品詳細ページ用）
export const findPublicReviewsByProductId = async (
  productId: string,
  params: { take?: number; skip?: number; sort?: ReviewSortOrder } = {},
) => {
  const { take = 20, skip = 0, sort = 'newest' } = params
  // 'helpful' ソート時は votes 件数で降順、同数なら createdAt 降順
  return prisma.review.findMany({
    where: { productId, isPublic: true },
    include: {
      user: { select: { id: true, name: true } },
      _count: { select: { votes: true } },
    },
    orderBy:
      sort === 'helpful'
        ? [{ votes: { _count: 'desc' } }, { createdAt: 'desc' }]
        : { createdAt: 'desc' },
    take,
    skip,
  })
}

// 公開レビュー件数取得（ページネーション用）
export const countPublicReviewsByProductId = async (productId: string) => {
  return prisma.review.count({ where: { productId, isPublic: true } })
}

// 平均評価・件数取得（商品詳細ページ用）
export const getReviewStatsByProductId = async (productId: string) => {
  const result = await prisma.review.aggregate({
    where: { productId, isPublic: true },
    _avg: { rating: true },
    _count: { rating: true },
  })
  return {
    average: result._avg.rating ?? 0,
    count: result._count.rating,
  }
}

// ユーザーが特定商品にレビュー済みかチェック
export const findReviewByUserAndProduct = async (userId: string, productId: string) => {
  return prisma.review.findUnique({ where: { userId_productId: { userId, productId } } })
}

// レビュー投稿（1ユーザー1商品1レビュー）
export const createReview = async (data: {
  rating: number
  comment?: string
  images?: string[]
  userId: string
  productId: string
}) => {
  return prisma.review.create({
    data: {
      rating: data.rating,
      comment: data.comment,
      images: data.images ?? [],
      userId: data.userId,
      productId: data.productId,
    },
  })
}

// 管理画面用レビュー一覧取得（全件・ページネーション）
export const findAllReviewsForAdmin = async (params: {
  isPublic?: boolean
  take?: number
  skip?: number
} = {}) => {
  const { isPublic, take = 20, skip = 0 } = params
  return prisma.review.findMany({
    where: isPublic !== undefined ? { isPublic } : undefined,
    include: {
      user: { select: { id: true, name: true, email: true } },
      product: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take,
    skip,
  })
}

// 管理画面用レビュー件数取得
export const countAllReviews = async (params: { isPublic?: boolean } = {}) => {
  const { isPublic } = params
  return prisma.review.count({
    where: isPublic !== undefined ? { isPublic } : undefined,
  })
}

// レビューの公開/非公開切替（管理画面用）
export const updateReviewVisibility = async (id: string, isPublic: boolean) => {
  return prisma.review.update({ where: { id }, data: { isPublic } })
}

// レビュー削除（管理画面用）
export const deleteReview = async (id: string) => {
  return prisma.review.delete({ where: { id } })
}

// レビュー1件取得（管理画面用）
export const findReviewById = async (id: string) => {
  return prisma.review.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      product: { select: { id: true, name: true } },
    },
  })
}

// 追加 (#132): レビュー1件取得（投票時の所有者確認用、軽量版）
export const findReviewOwner = async (id: string) => {
  return prisma.review.findUnique({
    where: { id },
    select: { id: true, userId: true, isPublic: true },
  })
}

// 追加 (#132): 指定ユーザーが投票済みのレビューID一覧を返す
export const findVotedReviewIdsByUser = async (
  userId: string,
  reviewIds: string[],
): Promise<Set<string>> => {
  if (reviewIds.length === 0) return new Set()
  const votes = await prisma.reviewVote.findMany({
    where: { userId, reviewId: { in: reviewIds } },
    select: { reviewId: true },
  })
  return new Set(votes.map((v) => v.reviewId))
}

// 追加 (#132): 投票を追加（重複時は P2002）
export const createReviewVote = async (params: { reviewId: string; userId: string }) => {
  return prisma.reviewVote.create({
    data: { reviewId: params.reviewId, userId: params.userId },
  })
}

// 追加 (#132): 投票を取り消す（存在しなくてもエラーにしない）
export const deleteReviewVote = async (params: { reviewId: string; userId: string }) => {
  return prisma.reviewVote.deleteMany({
    where: { reviewId: params.reviewId, userId: params.userId },
  })
}

// 追加 (#132): 投票数を取得
export const countReviewVotes = async (reviewId: string) => {
  return prisma.reviewVote.count({ where: { reviewId } })
}

// 型エクスポート
export type ReviewWithUser = Awaited<ReturnType<typeof findPublicReviewsByProductId>>[number]
export type AdminReview = Awaited<ReturnType<typeof findAllReviewsForAdmin>>[number]
