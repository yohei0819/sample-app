import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma' // 追加: 商品存在確認用
import {
  addProductToWishlist,
  findWishlistByUserId,
  isProductInWishlist,
} from '@/lib/db/wishlist'
import { logger } from '@/lib/logger' // 追加

// POST /api/wishlist リクエストスキーマ
const addWishlistSchema = z.object({
  productId: z.string().min(1, '商品IDは必須です'),
})

// GET /api/wishlist - ウィッシュリスト一覧取得（要認証）
export const GET = async () => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'ログインが必要です', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
  }

  try {
    const wishlist = await findWishlistByUserId(session.user.id)
    const items = wishlist?.items ?? []
    return NextResponse.json({ items })
  } catch (err) {
    logger.error('[wishlist GET] エラー', { err }) // 変更
    return NextResponse.json(
      { error: 'ウィッシュリストの取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}

// POST /api/wishlist - 商品追加（要認証）
export const POST = async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'ログインが必要です', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'リクエスト形式が不正です', code: 'BAD_REQUEST' },
      { status: 400 },
    )
  }

  const parsed = addWishlistSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: '入力値が不正です', code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const { productId } = parsed.data
  const userId = session.user.id

  try {
    // 追加: 商品の存在確認（存在しないIDへの外部キー制約違反を防ぐ）
    const product = await prisma.product.findUnique({
      where: { id: productId, isPublished: true },
      select: { id: true },
    })
    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }

    // 重複チェック
    const alreadyExists = await isProductInWishlist(userId, productId)
    if (alreadyExists) {
      return NextResponse.json(
        { error: 'すでにウィッシュリストに追加済みです', code: 'ALREADY_EXISTS' },
        { status: 409 },
      )
    }

    await addProductToWishlist(userId, productId)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    logger.error('[wishlist POST] エラー', { err }) // 変更
    return NextResponse.json(
      { error: 'ウィッシュリストへの追加に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
