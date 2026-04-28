// 注文 API（一覧取得・作成）
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createOrder, findOrdersByUserId } from '@/lib/db/orders'
import { validateCartItems } from '@/lib/db/products'
import { findCouponByCode, incrementCouponUsedCount } from '@/lib/db/coupons' // 追加
import type { Prisma } from '@/generated/prisma/client'
import type { ShippingAddress } from '@/constants/checkout'

type CartItemInput = {
  id: string
  quantity: number
}

type RequestBody = {
  items: CartItemInput[]
  shippingAddress: ShippingAddress
  stripePaymentIntentId: string
  couponCode?: string // 追加
}

// GET /api/orders - ログインユーザーの注文一覧取得
export const GET = async () => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const orders = await findOrdersByUserId(session.user.id)
    return NextResponse.json({ orders })
  } catch (err) {
    console.error('[orders GET] エラー:', err)
    return NextResponse.json({ error: '注文一覧の取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}

// POST /api/orders
export const POST = async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const body: unknown = await req.json()
  if (
    !body ||
    typeof body !== 'object' ||
    !('items' in body) ||
    !('shippingAddress' in body) ||
    !('stripePaymentIntentId' in body) ||
    !Array.isArray((body as RequestBody).items) ||
    (body as RequestBody).items.length === 0
  ) {
    return NextResponse.json({ error: 'リクエストが不正です', code: 'BAD_REQUEST' }, { status: 400 })
  }

  const { items, shippingAddress, stripePaymentIntentId } = body as RequestBody
  const couponCode = (body as RequestBody).couponCode // 追加

  try {
    // 各商品の最新価格・在庫を DB から取得して検証
    const productData = await validateCartItems(items)

    // 合計金額（税抜小計）
    const subtotal = productData.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)

    // クーポン検証・割引計算 // 追加
    let discountAmount = 0
    let couponId: string | undefined = undefined
    if (couponCode) {
      const coupon = await findCouponByCode(couponCode)
      if (
        coupon &&
        coupon.isActive &&
        (!coupon.expiresAt || coupon.expiresAt >= new Date()) &&
        (coupon.maxUses === null || coupon.usedCount < coupon.maxUses)
      ) {
        discountAmount = Math.floor(subtotal * (coupon.discountPct / 100))
        couponId = coupon.id
      }
    }

    // 割引後小計 + 消費税（10%）
    const discountedSubtotal = subtotal - discountAmount
    const tax = Math.floor(discountedSubtotal * 0.1)
    const totalPrice = discountedSubtotal + tax

    const order = await createOrder({
      status: 'PENDING',
      totalPrice,
      stripePaymentIntentId,
      shippingAddress: shippingAddress as unknown as Prisma.InputJsonValue,
      user: { connect: { id: session.user.id } },
      ...(couponId ? { coupon: { connect: { id: couponId } } } : {}), // 追加
      items: {
        create: productData.map(({ product, quantity }) => ({
          quantity,
          unitPrice: product.price,
          product: { connect: { id: product.id } },
        })),
      },
    })

    // クーポン使用回数+1 // 追加
    if (couponId) {
      await incrementCouponUsedCount(couponId)
    }

    return NextResponse.json({ orderId: order.id }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    console.error('[orders POST] エラー:', err)
    return NextResponse.json({ error: message, code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
