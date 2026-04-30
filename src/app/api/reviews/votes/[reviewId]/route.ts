// 追加 (#132): レビュー有用性投票 API
// パス: POST/DELETE /api/reviews/votes/[reviewId]
// 補足: ルートは `/api/reviews/[productId]` と衝突させないため `votes/` セグメントを挟んでいる
//       （Next.js の動的セグメントは同階層で名前を変えられないため、別パスに切り出している）
// POST   : 投票を追加（同一ユーザーが投票済みなら 409、自分のレビューには 403）
// DELETE : 投票を取り消し
import { NextRequest, NextResponse } from 'next/server'
import { REVIEW_ERROR_CODE } from '@/constants/reviews'
import { PrismaClientKnownRequestError } from '@/generated/prisma/internal/prismaNamespace'
import { auth } from '@/lib/auth'
import {
  countReviewVotes,
  createReviewVote,
  deleteReviewVote,
  findReviewOwner,
} from '@/lib/db/reviews'
import { logger } from '@/lib/logger'
import { enforceRateLimit } from '@/lib/rateLimit'

// POST /api/reviews/votes/[reviewId] - 投票
export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> },
) => {
  const limited = enforceRateLimit('REVIEW_VOTE', req)
  if (limited) return limited

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'ログインが必要です', code: REVIEW_ERROR_CODE.UNAUTHORIZED },
      { status: 401 },
    )
  }

  const { reviewId } = await params
  const userId = session.user.id

  const review = await findReviewOwner(reviewId)
  if (!review || !review.isPublic) {
    return NextResponse.json(
      { error: 'レビューが見つかりません', code: REVIEW_ERROR_CODE.NOT_FOUND },
      { status: 404 },
    )
  }
  if (review.userId === userId) {
    return NextResponse.json(
      { error: '自分のレビューには投票できません', code: REVIEW_ERROR_CODE.SELF_VOTE_FORBIDDEN },
      { status: 403 },
    )
  }

  try {
    await createReviewVote({ reviewId, userId })
    const count = await countReviewVotes(reviewId)
    return NextResponse.json({ voted: true, count }, { status: 201 })
  } catch (err) {
    // 重複投票（冪等性担保のため 409 で返却）
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      const count = await countReviewVotes(reviewId)
      return NextResponse.json(
        { voted: true, count, code: REVIEW_ERROR_CODE.ALREADY_EXISTS },
        { status: 409 },
      )
    }
    logger.error('[reviews/vote POST] エラー', { err })
    return NextResponse.json(
      { error: '投票に失敗しました', code: REVIEW_ERROR_CODE.INTERNAL },
      { status: 500 },
    )
  }
}

// DELETE /api/reviews/votes/[reviewId] - 投票取り消し
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> },
) => {
  const limited = enforceRateLimit('REVIEW_VOTE', req)
  if (limited) return limited

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'ログインが必要です', code: REVIEW_ERROR_CODE.UNAUTHORIZED },
      { status: 401 },
    )
  }

  const { reviewId } = await params
  const userId = session.user.id

  try {
    await deleteReviewVote({ reviewId, userId })
    const count = await countReviewVotes(reviewId)
    return NextResponse.json({ voted: false, count })
  } catch (err) {
    logger.error('[reviews/vote DELETE] エラー', { err })
    return NextResponse.json(
      { error: '投票の取り消しに失敗しました', code: REVIEW_ERROR_CODE.INTERNAL },
      { status: 500 },
    )
  }
}
