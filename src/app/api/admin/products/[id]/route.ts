// 管理画面 商品更新・削除 API
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { deleteProduct, findProductByIdForAdmin, updateProduct } from '@/lib/db/products'
import { productSchema } from '@/lib/validators/product'
// 追加: 在庫が 0→1 以上に増加した際の自動再入荷通知 (#76)
import { findUnnotifiedByProductId, markAsNotified } from '@/lib/db/backInStock'
import { sendBackInStockNotificationEmail } from '@/lib/email/sendBackInStockNotification'

// 追加: 在庫補充時に未通知購読者に再入荷メールを送信する内部関数
// fire-and-forget で呼び出され、レスポンスをブロックしない
const notifyBackInStockSubscribers = async (product: {
  id: string
  name: string
  images: string[]
}) => {
  try {
    const subscriptions = await findUnnotifiedByProductId(product.id)
    if (subscriptions.length === 0) return
    const sentIds: string[] = []
    for (const sub of subscriptions) {
      const result = await sendBackInStockNotificationEmail({
        to: sub.email,
        product: { id: product.id, name: product.name, images: product.images },
      })
      if (result.success) sentIds.push(sub.id)
    }
    if (sentIds.length > 0) {
      await markAsNotified(sentIds)
    }
  } catch (err) {
    console.error('[notifyBackInStockSubscribers] エラー:', err)
  }
}

// PUT /api/admin/products/[id] - 商品更新
export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 変更: Next.js 15 の非同期 params
) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { id } = await params // 変更
  const existing = await findProductByIdForAdmin(id)
  if (!existing) {
    return NextResponse.json({ error: '商品が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
  }

  try {
    const body: unknown = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: '入力内容に誤りがあります', details: parsed.error.flatten() }, { status: 400 })
    }

    const { name, description, price, stock, categoryId, isPublished, images, lowStockThreshold } = parsed.data
    const product = await updateProduct(
      id,
      {
        name,
        description,
        price,
        stock,
        isPublished,
        images,
        ...(lowStockThreshold !== undefined ? { lowStockThreshold } : {}),
        ...(categoryId !== undefined
          ? { category: categoryId ? { connect: { id: categoryId } } : { disconnect: true } }
          : {}),
      },
      { userId: check.session.user.id }, // 変更 (#106): 在庫変動履歴に操作者を記録
    )
    // 追加: 在庫が 0 → 1 以上に変化したら未通知購読者に自動メール送信 (#76)
    if (existing.stock <= 0 && product.stock > 0) {
      // fire-and-forget: レスポンスをブロックしないため意図的に await しない
      void notifyBackInStockSubscribers({
        id: product.id,
        name: product.name,
        images: product.images,
      })
    }
    return NextResponse.json({ product })
  } catch (err) {
    console.error('[admin/products PUT] エラー:', err)
    return NextResponse.json({ error: '商品の更新に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}

// DELETE /api/admin/products/[id] - 商品削除
export const DELETE = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 変更: Next.js 15 の非同期 params
) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { id } = await params // 変更
  const existing = await findProductByIdForAdmin(id)
  if (!existing) {
    return NextResponse.json({ error: '商品が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
  }

  try {
    await deleteProduct(id)
    return NextResponse.json({ message: '商品を削除しました' })
  } catch (err) {
    console.error('[admin/products DELETE] エラー:', err)
    return NextResponse.json({ error: '商品の削除に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
