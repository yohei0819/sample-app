import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_REVIEW_SORT, REVIEW_SORT_ORDERS, type ReviewSortOrder } from '@/constants/reviews'
import { PrismaClientKnownRequestError } from '@/generated/prisma/internal/prismaNamespace'
import { auth } from '@/lib/auth'
import {
  countPublicReviewsByProductId,
  createReview,
  findPublicReviewsByProductId,
  findReviewByUserAndProduct,
  findVotedReviewIdsByUser,
} from '@/lib/db/reviews'
import { logger } from '@/lib/logger'
import { reviewInputSchema } from '@/lib/validators/review'

// GET /api/reviews/[productId] - 公開レビュー一覧取得
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) => {
  const { productId } = await params
  const { searchParams } = req.nextUrl
  const take = Math.min(Number(searchParams.get('take') ?? 20), 50)
  const skip = Number(searchParams.get('skip') ?? 0)
  // 追加 (#132): ソート順
  const sortParam = searchParams.get('sort') ?? DEFAULT_REVIEW_SORT
  const sort: ReviewSortOrder = (REVIEW_SORT_ORDERS as readonly string[]).includes(sortParam)
    ? (sortParam as ReviewSortOrder)
    : DEFAULT_REVIEW_SORT

  try {
    const [reviews, total] = await Promise.all([
      findPublicReviewsByProductId(productId, { take, skip, sort }),
      countPublicReviewsByProductId(productId),
    ])

    // 追加 (#132): ログイン中であれば、自分が投票済みのレビューIDを返す
    const session = await auth()
    let votedReviewIds: string[] = []
    if (session?.user?.id) {
      const set = await findVotedReviewIdsByUser(
        session.user.id,
        reviews.map((r) => r.id),
      )
      votedReviewIds = Array.from(set)
    }

    return NextResponse.json({ reviews, total, votedReviewIds })
  } catch (err) {
    logger.error('[reviews GET] エラー', { err })
    return NextResponse.json(
      { error: 'レビューの取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}

// POST /api/reviews/[productId] - レビュー投稿（要認証）
export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'ログインが必要です', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
  }

  const { productId } = await params
  const userId = session.user.id

  // 既存レビュー確認（1ユーザー1商品1レビュー）
  const existing = await findReviewByUserAndProduct(userId, productId)
  if (existing) {
    return NextResponse.json(
      { error: 'すでにレビューを投稿済みです', code: 'ALREADY_EXISTS' },
      { status: 409 },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です', code: 'BAD_REQUEST' }, { status: 400 })
  }

  const parsed = reviewInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: '入力値が不正です', code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  try {
    const review = await createReview({
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      images: parsed.data.images, // 追加 (#132)
      userId,
      productId,
    })
    return NextResponse.json({ review }, { status: 201 })
  } catch (err) {
    // 同時投稿によるユニーク制約違反（P2002）を 409 で返す
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json(
        { error: 'すでにレビューを投稿済みです', code: 'ALREADY_EXISTS' },
        { status: 409 },
      )
    }
    logger.error('[reviews POST] エラー', { err })
    return NextResponse.json(
      { error: 'レビューの投稿に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
