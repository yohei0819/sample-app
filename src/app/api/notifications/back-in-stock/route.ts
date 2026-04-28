// バックインストック通知購読API（認証不要）
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createSubscription } from '@/lib/db/backInStock'
import { subscribeSchema } from '@/lib/validators/backInStock'

// POST /api/notifications/back-in-stock - 在庫切れ商品の再入荷通知購読
export const POST = async (req: NextRequest) => {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'リクエスト形式が不正です', code: 'BAD_REQUEST' },
      { status: 400 },
    )
  }

  const parsed = subscribeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: '入力値が不正です',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    )
  }

  const { email, productId } = parsed.data

  try {
    // 商品の存在確認 + 在庫切れチェック
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, isPublished: true },
    })

    if (!product || !product.isPublished) {
      return NextResponse.json(
        { error: '商品が見つかりません', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }

    // 在庫がある商品では購読を受け付けない
    if (product.stock > 0) {
      return NextResponse.json(
        { error: 'この商品は現在在庫があります', code: 'PRODUCT_IN_STOCK' },
        { status: 400 },
      )
    }

    await createSubscription(email, productId)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[notifications/back-in-stock POST] エラー:', err)
    return NextResponse.json(
      { error: '通知購読の登録に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
