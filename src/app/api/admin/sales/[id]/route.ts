// 追加 (#107): タイムセール管理 API（更新・削除）
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import {
  deleteSale,
  findOverlappingSale,
  findSaleById,
  updateSale,
} from '@/lib/db/sales'
import { findProductByIdForAdmin } from '@/lib/db/products'
import { saleApiSchema } from '@/lib/validators/sale'

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }
  const { id } = await params
  const existing = await findSaleById(id)
  if (!existing) {
    return NextResponse.json({ error: 'セールが見つかりません', code: 'NOT_FOUND' }, { status: 404 })
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

    const overlap = await findOverlappingSale({
      productId,
      startsAt,
      endsAt,
      excludeId: id,
    })
    if (overlap) {
      return NextResponse.json(
        { error: '同じ期間に有効なセールが既に存在します', code: 'OVERLAP' },
        { status: 409 },
      )
    }

    const sale = await updateSale(id, { salePrice, startsAt, endsAt, isActive })
    return NextResponse.json({ sale })
  } catch (err) {
    console.error('[admin/sales PUT] エラー:', err)
    return NextResponse.json(
      { error: 'セールの更新に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}

export const DELETE = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }
  const { id } = await params
  try {
    await deleteSale(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/sales DELETE] エラー:', err)
    return NextResponse.json(
      { error: 'セールの削除に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
