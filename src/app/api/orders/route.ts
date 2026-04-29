// 注文 API（一覧取得・作成）
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createOrder, findOrdersByUserId } from '@/lib/db/orders'
import { validateCartItems } from '@/lib/db/products'
import { findCouponByCode, incrementCouponUsedCountAtomic } from '@/lib/db/coupons' // 変更
import type { Prisma } from '@/generated/prisma/client'
import type { ShippingAddress } from '@/constants/checkout'
import { sendOrderConfirmationEmail } from '@/lib/email/sendOrderConfirmation' // 追加
import { enforceRateLimit } from '@/lib/rateLimit'
import { logger } from '@/lib/logger' // 追加

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
    logger.error('[orders GET] エラー', { err }) // 変更
    return NextResponse.json({ error: '注文一覧の取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}

// POST /api/orders
export const POST = async (req: NextRequest) => {
  // 追加: レート制限（不正な連続注文作成を防ぐ）
  const limited = enforceRateLimit('ORDER_CREATE', req)
  if (limited) return limited

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
    let couponMaxUses: number | null = null // 追加（アトミック更新用）
    if (couponCode) {
      const coupon = await findCouponByCode(couponCode)
      // クーポンが存在しない・無効・期限切れ・上限到達の場合は400エラー // 変更
      if (
        !coupon ||
        !coupon.isActive ||
        (coupon.expiresAt && coupon.expiresAt < new Date()) ||
        (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
      ) {
        return NextResponse.json(
          { error: 'クーポンが無効または使用できません', code: 'INVALID_COUPON' },
          { status: 400 },
        )
      }
      discountAmount = Math.floor(subtotal * (coupon.discountPct / 100))
      couponId = coupon.id
      couponMaxUses = coupon.maxUses // 追加
    }

    // 割引後小計 + 消費税（10%）
    const discountedSubtotal = subtotal - discountAmount
    const tax = Math.floor(discountedSubtotal * 0.1)
    const totalPrice = discountedSubtotal + tax

    // クーポン使用回数アトミック更新（createOrderより前に実施してレースコンディションを防ぐ） // 変更
    if (couponId) {
      const updated = await incrementCouponUsedCountAtomic(couponId, couponMaxUses)
      if (updated === 0) {
        // 別リクエストが先に上限に達した場合は注文を作成しない
        return NextResponse.json(
          { error: 'クーポンの利用上限に達しました', code: 'COUPON_LIMIT_EXCEEDED' },
          { status: 400 },
        )
      }
    }

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

    // 追加: 注文確認メール送信（失敗してもorderレスポンスは正常に返す）
    if (session.user.email) {
      await sendOrderConfirmationEmail({
        to: session.user.email,
        order: {
          id: order.id,
          totalPrice: order.totalPrice,
          shippingAddress,
        },
        items: productData.map(({ product, quantity }) => ({
          productName: product.name,
          quantity,
          unitPrice: product.price,
        })),
      })
    }

    return NextResponse.json({ orderId: order.id }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    logger.error('[orders POST] エラー', { err }) // 変更
    return NextResponse.json({ error: message, code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
