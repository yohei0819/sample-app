// Stripe PaymentIntent 作成 API
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { validateCartItems } from '@/lib/db/products'
import { findCouponByCode } from '@/lib/db/coupons' // 追加
import { stripe } from '@/lib/stripe'
import { enforceRateLimit } from '@/lib/rateLimit'
import { logger } from '@/lib/logger' // 追加

type CartItemInput = {
  id: string
  quantity: number
}

type RequestBody = {
  items: CartItemInput[]
  couponCode?: string // 追加
}

// POST /api/stripe/payment-intent
export const POST = async (req: NextRequest) => {
  // 追加: レート制限
  const limited = enforceRateLimit('PAYMENT_INTENT', req)
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
    !Array.isArray((body as RequestBody).items) ||
    (body as RequestBody).items.length === 0
  ) {
    return NextResponse.json({ error: 'カートが空です', code: 'BAD_REQUEST' }, { status: 400 })
  }

  const { items } = body as RequestBody
  const couponCode = (body as RequestBody).couponCode // 追加

  try {
    // 各商品の最新価格・在庫を DB から取得して検証
    const productData = await validateCartItems(items)

    // 合計金額（税抜小計）
    const subtotal = productData.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)

    // クーポン割引計算（適用可能なクーポンのみ） // 追加
    let discountAmount = 0
    if (couponCode) {
      const coupon = await findCouponByCode(couponCode)
      if (
        coupon &&
        coupon.isActive &&
        (!coupon.expiresAt || coupon.expiresAt >= new Date()) &&
        (coupon.maxUses === null || coupon.usedCount < coupon.maxUses)
      ) {
        discountAmount = Math.floor(subtotal * (coupon.discountPct / 100))
      }
    }

    // 割引後小計 + 消費税（10%） // 変更
    const discountedSubtotal = subtotal - discountAmount
    const tax = Math.floor(discountedSubtotal * 0.1)
    const totalPrice = discountedSubtotal + tax

    // Stripe PaymentIntent 作成（金額は円単位なので通貨は jpy）
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice,
      currency: 'jpy',
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    logger.error('[stripe/payment-intent POST] エラー', { err }) // 変更
    return NextResponse.json({ error: message, code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
