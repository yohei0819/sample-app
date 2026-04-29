// 追加 (#107): タイムセール管理 API（一覧・作成）
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { AuditAction, recordAuditLog } from '@/lib/audit' // 追加 (#121)
import {
  createSale,
  findAllSales,
  findOverlappingSale,
} from '@/lib/db/sales'
import { findProductByIdForAdmin } from '@/lib/db/products'
import { saleApiSchema } from '@/lib/validators/sale'

export const GET = async () => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }
  try {
    const sales = await findAllSales()
    return NextResponse.json({ sales })
  } catch (err) {
    console.error('[admin/sales GET] エラー:', err)
    return NextResponse.json(
      { error: 'セール一覧の取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}

export const POST = async (req: NextRequest) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  try {
    const body: unknown = await req.json()
    const parsed = saleApiSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: '入力内容に誤りがあります', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { productId, salePrice, startsAt, endsAt, isActive } = parsed.data
    const product = await findProductByIdForAdmin(productId)
    if (!product) {
      return NextResponse.json(
        { error: '指定された商品が存在しません', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }
    if (salePrice >= product.price) {
      return NextResponse.json(
        { error: 'セール価格は通常価格より低くしてください', code: 'INVALID_PRICE' },
        { status: 400 },
      )
    }

    const overlap = await findOverlappingSale({ productId, startsAt, endsAt })
    if (overlap) {
      return NextResponse.json(
        { error: '同じ期間に有効なセールが既に存在します', code: 'OVERLAP' },
        { status: 409 },
      )
    }

    const sale = await createSale({ productId, salePrice, startsAt, endsAt, isActive })
    // 追加 (#121): 監査ログ記録
    await recordAuditLog({
      actorId: check.session.user.id,
      action: AuditAction.SALE_CREATE,
      targetType: 'Sale',
      targetId: sale.id,
      metadata: { productId, salePrice, startsAt, endsAt, isActive },
    })
    return NextResponse.json({ sale }, { status: 201 })
  } catch (err) {
    console.error('[admin/sales POST] エラー:', err)
    return NextResponse.json(
      { error: 'セールの作成に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
