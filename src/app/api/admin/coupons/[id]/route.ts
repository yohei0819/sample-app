// 管理画面 クーポン更新・削除 API
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { findCouponById, updateCoupon } from '@/lib/db/coupons'
import { couponSchema } from '@/lib/validators/coupon'

type RouteParams = { params: Promise<{ id: string }> }

// PUT /api/admin/coupons/[id] - クーポン更新・無効化
export const PUT = async (req: NextRequest, { params }: RouteParams) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { id } = await params

  const existing = await findCouponById(id)
  if (!existing) {
    return NextResponse.json({ error: 'クーポンが見つかりません', code: 'NOT_FOUND' }, { status: 404 })
  }

  const body: unknown = await req.json()
  const parsed = couponSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'バリデーションエラー', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const { code, discountPct, maxUses, expiresAt, isActive } = parsed.data

  try {
    const coupon = await updateCoupon(id, {
      ...(code !== undefined ? { code } : {}),
      ...(discountPct !== undefined ? { discountPct } : {}),
      ...(maxUses !== undefined ? { maxUses: maxUses ?? null } : {}),
      ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    })
    return NextResponse.json({ coupon })
  } catch (err: unknown) {
    if (
      err !== null &&
      typeof err === 'object' &&
      'code' in err &&
      (err as Record<string, unknown>).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'このクーポンコードはすでに使用されています', code: 'CONFLICT' }, { status: 409 })
    }
    console.error('[admin/coupons/[id] PUT] エラー:', err)
    return NextResponse.json({ error: 'クーポンの更新に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}

// DELETE /api/admin/coupons/[id] - クーポン削除
export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { id } = await params

  const existing = await findCouponById(id)
  if (!existing) {
    return NextResponse.json({ error: 'クーポンが見つかりません', code: 'NOT_FOUND' }, { status: 404 })
  }

  try {
    // 注文との関連解除（ordersのcouponIdをnullに）してから削除
    const { prisma } = await import('@/lib/db/prisma')
    await prisma.order.updateMany({ where: { couponId: id }, data: { couponId: null } })
    await prisma.coupon.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/coupons/[id] DELETE] エラー:', err)
    return NextResponse.json({ error: 'クーポンの削除に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
