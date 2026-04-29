// カート操作 API（#119）
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { enforceRateLimit } from '@/lib/rateLimit'
import {
  addCartItem,
  clearCart,
  getOrCreateCart,
  mergeLocalCart,
  removeCartItem,
  updateCartItemQuantity,
} from '@/lib/db/carts'

// GET /api/cart - 現在のカートを取得
export const GET = async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }
  const limited = enforceRateLimit('CART_OPERATION', req)
  if (limited) return limited

  try {
    const cart = await getOrCreateCart(session.user.id)
    return NextResponse.json({ cart })
  } catch (err) {
    console.error('[cart GET] エラー:', err)
    return NextResponse.json({ error: 'カート取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}

const postSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(100),
})

// POST /api/cart - 商品をカートに追加
export const POST = async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }
  const limited = enforceRateLimit('CART_OPERATION', req)
  if (limited) return limited

  try {
    const body: unknown = await req.json()
    const parsed = postSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'リクエスト形式が不正です', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }
    await addCartItem({
      userId: session.user.id,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
    })
    const cart = await getOrCreateCart(session.user.id)
    return NextResponse.json({ cart })
  } catch (err) {
    console.error('[cart POST] エラー:', err)
    return NextResponse.json({ error: 'カートへの追加に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}

const patchSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(0).max(100),
})

// PATCH /api/cart - 数量更新
export const PATCH = async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }
  const limited = enforceRateLimit('CART_OPERATION', req)
  if (limited) return limited

  try {
    const body: unknown = await req.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'リクエスト形式が不正です', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }
    await updateCartItemQuantity({
      userId: session.user.id,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
    })
    const cart = await getOrCreateCart(session.user.id)
    return NextResponse.json({ cart })
  } catch (err) {
    console.error('[cart PATCH] エラー:', err)
    return NextResponse.json({ error: 'カート更新に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}

// DELETE /api/cart - 全削除 or 単一削除（?productId=...）
export const DELETE = async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }
  const limited = enforceRateLimit('CART_OPERATION', req)
  if (limited) return limited

  try {
    const productId = req.nextUrl.searchParams.get('productId')
    if (productId) {
      await removeCartItem({ userId: session.user.id, productId })
    } else {
      await clearCart(session.user.id)
    }
    const cart = await getOrCreateCart(session.user.id)
    return NextResponse.json({ cart })
  } catch (err) {
    console.error('[cart DELETE] エラー:', err)
    return NextResponse.json({ error: 'カート削除に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}

// PUT /api/cart/merge - ローカル（ゲスト）カートをサーバーカートにマージ
const mergeSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().max(100),
      }),
    )
    .max(100),
})

export const PUT = async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }
  const limited = enforceRateLimit('CART_OPERATION', req)
  if (limited) return limited

  try {
    const body: unknown = await req.json()
    const parsed = mergeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'リクエスト形式が不正です', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }
    await mergeLocalCart(session.user.id, parsed.data.items)
    const cart = await getOrCreateCart(session.user.id)
    return NextResponse.json({ cart })
  } catch (err) {
    console.error('[cart PUT merge] エラー:', err)
    return NextResponse.json({ error: 'カートマージに失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
