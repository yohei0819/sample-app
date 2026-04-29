// 追加 (#106): 商品の在庫変動履歴 API（管理画面用）
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { findStockMovementsByProductId } from '@/lib/db/stockMovements'

const querySchema = z.object({
  productId: z.string().min(1),
  take: z.coerce.number().int().min(1).max(100).optional(),
  skip: z.coerce.number().int().min(0).optional(),
})

// GET /api/admin/stock-movements?productId=xxx&take=50&skip=0
export const GET = async (req: NextRequest) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { searchParams } = new URL(req.url)
  const parsed = querySchema.safeParse({
    productId: searchParams.get('productId') ?? '',
    take: searchParams.get('take') ?? undefined,
    skip: searchParams.get('skip') ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'パラメータが不正です', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  try {
    const movements = await findStockMovementsByProductId(parsed.data)
    return NextResponse.json({ movements })
  } catch (err) {
    console.error('[admin/stock-movements GET] エラー:', err)
    return NextResponse.json(
      { error: '履歴の取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
