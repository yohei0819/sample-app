// 注文作成 API（チェックアウトフォーム送信時に呼ばれる）
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createOrder } from '@/lib/db/orders'
import { findProductById } from '@/lib/db/products'
import type { ShippingAddress } from '@/constants/checkout'

type CartItemInput = {
  id: string
  quantity: number
}

type RequestBody = {
  items: CartItemInput[]
  shippingAddress: ShippingAddress
  stripePaymentIntentId: string
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

  try {
    // 各商品の最新価格・在庫を DB から取得して検証
    const productData = await Promise.all(
      items.map(async ({ id, quantity }) => {
        const product = await findProductById(id)
        if (!product) throw new Error(`商品が見つかりません: ${id}`)
        if (!product.isPublished) throw new Error(`非公開商品です: ${id}`)
        if (product.stock < quantity) throw new Error(`在庫不足: ${product.name}`)
        return { product, quantity }
      })
    )

    // 合計金額（税込10%）
    const subtotal = productData.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)
    const tax = Math.floor(subtotal * 0.1)
    const totalPrice = subtotal + tax

    const order = await createOrder({
      status: 'PENDING',
      totalPrice,
      stripePaymentIntentId,
      shippingAddress: shippingAddress as unknown as import('@/generated/prisma/client').Prisma.InputJsonValue,
      user: { connect: { id: session.user.id } },
      items: {
        create: productData.map(({ product, quantity }) => ({
          quantity,
          unitPrice: product.price,
          product: { connect: { id: product.id } },
        })),
      },
    })

    return NextResponse.json({ orderId: order.id }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    console.error('[orders POST] エラー:', err)
    return NextResponse.json({ error: message, code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
