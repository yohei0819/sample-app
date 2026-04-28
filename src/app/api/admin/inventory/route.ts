// 管理画面 在庫一覧・一括更新 API
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { findAllProductsForAdmin, updateProduct } from '@/lib/db/products'
import { inventoryUpdateSchema } from '@/lib/validators/category'

// GET /api/admin/inventory - 在庫一覧取得
export const GET = async () => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  try {
    const products = await findAllProductsForAdmin()
    return NextResponse.json({ products })
  } catch (err) {
    console.error('[admin/inventory GET] エラー:', err)
    return NextResponse.json(
      { error: '在庫一覧の取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/inventory - 在庫一括更新
export const PATCH = async (req: NextRequest) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  try {
    const body: unknown = await req.json()
    const parsed = inventoryUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: '入力内容に誤りがあります', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // 各商品の在庫を更新
    await Promise.all(
      parsed.data.items.map(({ id, stock }) => updateProduct(id, { stock }))
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/inventory PATCH] エラー:', err)
    return NextResponse.json(
      { error: '在庫の更新に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    )
  }
}
