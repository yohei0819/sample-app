// 管理画面 クーポン一覧・作成 API
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { findAllCoupons, createCoupon } from '@/lib/db/coupons'
import { couponSchema } from '@/lib/validators/coupon'

// GET /api/admin/coupons - クーポン一覧取得
export const GET = async () => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  try {
    const coupons = await findAllCoupons()
    return NextResponse.json({ coupons })
  } catch (err) {
    console.error('[admin/coupons GET] エラー:', err)
    return NextResponse.json({ error: 'クーポン一覧の取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}

// POST /api/admin/coupons - クーポン作成
export const POST = async (req: NextRequest) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const body: unknown = await req.json()
  const parsed = couponSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'バリデーションエラー', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const { code, discountPct, maxUses, expiresAt, isActive } = parsed.data

  try {
    const coupon = await createCoupon({
      code,
      discountPct,
      maxUses: maxUses ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: isActive,
    })
    return NextResponse.json({ coupon }, { status: 201 })
  } catch (err: unknown) {
    // コード重複
    if (
      err !== null &&
      typeof err === 'object' &&
      'code' in err &&
      (err as Record<string, unknown>).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'このクーポンコードはすでに使用されています', code: 'CONFLICT' }, { status: 409 })
    }
    console.error('[admin/coupons POST] エラー:', err)
    return NextResponse.json({ error: 'クーポンの作成に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
