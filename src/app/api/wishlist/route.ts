import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import {
  addProductToWishlist,
  findWishlistByUserId,
  isProductInWishlist,
} from '@/lib/db/wishlist'

// POST /api/wishlist リクエストスキーマ
const addWishlistSchema = z.object({
  productId: z.string().min(1, '商品IDは必須です'),
})

// GET /api/wishlist - ウィッシュリスト一覧取得（要認証）
export const GET = async (_req: NextRequest) => {
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
    console.error('[wishlist GET] エラー:', err)
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
    console.error('[wishlist POST] エラー:', err)
    return NextResponse.json(
      { error: 'ウィッシュリストへの追加に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
