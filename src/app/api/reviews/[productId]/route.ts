import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import {
  countPublicReviewsByProductId,
  createReview,
  findPublicReviewsByProductId,
  findReviewByUserAndProduct,
} from '@/lib/db/reviews'

// レビュー投稿スキーマ
const reviewSchema = z.object({
  rating: z.number().int().min(1, '評価は1以上で入力してください').max(5, '評価は5以下で入力してください'),
  comment: z.string().max(1000, 'コメントは1000文字以内で入力してください').optional(),
})

// GET /api/reviews/[productId] - 公開レビュー一覧取得
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) => {
  const { productId } = await params
  const { searchParams } = req.nextUrl
  const take = Math.min(Number(searchParams.get('take') ?? 20), 50)
  const skip = Number(searchParams.get('skip') ?? 0)

  try {
    const [reviews, total] = await Promise.all([
      findPublicReviewsByProductId(productId, { take, skip }),
      countPublicReviewsByProductId(productId),
    ])
    return NextResponse.json({ reviews, total })
  } catch (err) {
    console.error('[reviews GET] エラー:', err)
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

  const parsed = reviewSchema.safeParse(body)
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
      userId,
      productId,
    })
    return NextResponse.json({ review }, { status: 201 })
  } catch (err) {
    console.error('[reviews POST] エラー:', err)
    return NextResponse.json(
      { error: 'レビューの投稿に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
