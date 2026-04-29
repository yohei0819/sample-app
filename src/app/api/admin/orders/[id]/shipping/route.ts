// 管理画面 注文配送情報更新 API（#118）
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { CARRIER_CODES } from '@/constants/shipping'
import { requireAdmin } from '@/lib/admin-auth'
import { findOrderById, updateOrderShipping } from '@/lib/db/orders'
import { sendShipmentNotificationEmail } from '@/lib/email/sendShipmentNotification'
import { shippingAddressSchema } from '@/lib/validators/order'

type RouteParams = {
  params: Promise<{ id: string }>
}

// 文字列を null/undefined に正規化（空文字や空白のみは null として扱う）
const trimmedNullable = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (v === null || v === undefined) return null
    const t = v.trim()
    return t.length === 0 ? null : t
  })

const shippingSchema = z.object({
  carrier: z.union([z.enum(CARRIER_CODES), z.null()]).optional().transform((v) => v ?? null),
  trackingNumber: trimmedNullable,
})

// PUT /api/admin/orders/:id/shipping - 配送業者・追跡番号を更新
export const PUT = async (req: NextRequest, { params }: RouteParams) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { id } = await params

  try {
    const body: unknown = await req.json()
    const parsed = shippingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: '無効な配送情報です', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    // 追跡番号が指定されているのに配送業者が指定されていない（またはその逆）はエラー
    const { carrier, trackingNumber } = parsed.data
    if ((carrier && !trackingNumber) || (!carrier && trackingNumber)) {
      return NextResponse.json(
        { error: '配送業者と追跡番号は両方指定してください', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }

    const before = await findOrderById(id)
    if (!before) {
      return NextResponse.json({ error: '注文が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }

    const updated = await updateOrderShipping(id, { carrier, trackingNumber })
    const after = await findOrderById(id)

    // 追跡番号が「新規に」設定された場合のみ発送通知メールを送る
    const trackingAdded = !before.trackingNumber && updated?.trackingNumber
    if (trackingAdded && after?.user?.email && after.shippingAddress) {
      const addressParsed = shippingAddressSchema.safeParse(after.shippingAddress)
      if (addressParsed.success) {
        await sendShipmentNotificationEmail({
          to: after.user.email,
          order: {
            id: after.id,
            shippingAddress: addressParsed.data,
            carrier: after.carrier,
            trackingNumber: after.trackingNumber,
          },
        })
      } else {
        console.error('[admin/orders/:id/shipping PUT] shippingAddress パース失敗:', addressParsed.error.flatten())
      }
    }

    return NextResponse.json({ order: after })
  } catch (err) {
    console.error('[admin/orders/:id/shipping PUT] エラー:', err)
    return NextResponse.json(
      { error: '配送情報の更新に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
