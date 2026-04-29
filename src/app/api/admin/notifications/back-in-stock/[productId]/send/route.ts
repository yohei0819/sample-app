// 管理者によるバックインストック通知の手動送信API
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db/prisma'
import {
  findUnnotifiedByProductId,
  markAsNotified,
} from '@/lib/db/backInStock'
import { sendBackInStockNotificationEmail } from '@/lib/email/sendBackInStockNotification'

type RouteContext = {
  // 変更: Next.js 15 の非同期 params
  params: Promise<{ productId: string }>
}

// POST /api/admin/notifications/back-in-stock/[productId]/send
// 在庫補充後、未通知の購読者全員にメール送信する
export const POST = async (_req: Request, context: RouteContext) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json(
      { error: check.error, code: 'FORBIDDEN' },
      { status: check.status },
    )
  }

  const { productId } = await context.params // 変更
  if (!productId) {
    return NextResponse.json(
      { error: '商品IDは必須です', code: 'BAD_REQUEST' },
      { status: 400 },
    )
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, images: true, stock: true }, // 変更: 在庫再確認のため stock を取得
    })

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }

    // 追加: 在庫切れの商品には誤送信を防ぐため通知しない
    if (product.stock <= 0) {
      return NextResponse.json(
        { error: '商品が在庫切れです', code: 'OUT_OF_STOCK' },
        { status: 409 },
      )
    }

    const subscriptions = await findUnnotifiedByProductId(productId)
    if (subscriptions.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    // 送信を順次実行（外部API失敗が連鎖しないよう逐次送信）
    const sentIds: string[] = []
    for (const sub of subscriptions) {
      const result = await sendBackInStockNotificationEmail({
        to: sub.email,
        product: { id: product.id, name: product.name, images: product.images },
      })
      if (result.success) {
        sentIds.push(sub.id)
      }
    }

    // 送信成功分のみ通知済みフラグを更新
    await markAsNotified(sentIds)

    return NextResponse.json({ sent: sentIds.length })
  } catch (err) {
    console.error('[admin/notifications/back-in-stock send POST] エラー:', err)
    return NextResponse.json(
      { error: '通知の送信に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
