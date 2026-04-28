// クーポンコード検証 API（購入者向け）
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { findCouponByCode } from '@/lib/db/coupons'
import { couponCodeSchema } from '@/lib/validators/coupon'

// POST /api/coupons/validate - クーポンコードの有効性を検証し割引率を返す
export const POST = async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const body: unknown = await req.json()
  const parsed = couponCodeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'バリデーションエラー', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const { code } = parsed.data

  try {
    const coupon = await findCouponByCode(code)

    if (!coupon) {
      return NextResponse.json({ error: 'クーポンコードが見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: 'このクーポンは無効です', code: 'COUPON_INACTIVE' }, { status: 400 })
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: 'このクーポンの有効期限が切れています', code: 'COUPON_EXPIRED' }, { status: 400 })
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'このクーポンの利用回数上限に達しています', code: 'COUPON_MAX_USES' }, { status: 400 })
    }

    return NextResponse.json({
      couponId: coupon.id,
      code: coupon.code,
      discountPct: coupon.discountPct,
    })
  } catch (err) {
    console.error('[coupons/validate POST] エラー:', err)
    return NextResponse.json({ error: 'クーポンの確認に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
