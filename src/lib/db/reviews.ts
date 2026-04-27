import { prisma } from '@/lib/db/prisma'

// 公開レビュー一覧取得（商品詳細ページ用）
export const findPublicReviewsByProductId = async (
  productId: string,
  params: { take?: number; skip?: number } = {},
) => {
  const { take = 20, skip = 0 } = params
  return prisma.review.findMany({
    where: { productId, isPublic: true },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
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
  userId: string
  productId: string
}) => {
  return prisma.review.create({ data })
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

// 型エクスポート
export type ReviewWithUser = Awaited<ReturnType<typeof findPublicReviewsByProductId>>[number]
export type AdminReview = Awaited<ReturnType<typeof findAllReviewsForAdmin>>[number]
