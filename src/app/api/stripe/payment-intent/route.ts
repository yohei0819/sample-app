// Stripe PaymentIntent 作成 API
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { validateCartItems } from '@/lib/db/products'
import { stripe } from '@/lib/stripe'

type CartItemInput = {
  id: string
  quantity: number
}

type RequestBody = {
  items: CartItemInput[]
}

// POST /api/stripe/payment-intent
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
    !Array.isArray((body as RequestBody).items) ||
    (body as RequestBody).items.length === 0
  ) {
    return NextResponse.json({ error: 'カートが空です', code: 'BAD_REQUEST' }, { status: 400 })
  }

  const { items } = body as RequestBody

  try {
    // 各商品の最新価格・在庫を DB から取得して検証
    const productData = await validateCartItems(items)

    // 合計金額（円単位・税込10%）
    const subtotal = productData.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)
    const tax = Math.floor(subtotal * 0.1)
    const totalPrice = subtotal + tax

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
    console.error('[stripe/payment-intent POST] エラー:', err)
    return NextResponse.json({ error: message, code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
