// アドレス帳 API（#134）更新・削除
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  deleteAddress,
  findAddressById,
  updateAddress,
} from '@/lib/db/addresses'
import { addressInputSchema } from '@/lib/validators/address'

type RouteParams = {
  params: Promise<{ id: string }>
}

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }
  const { id } = await params
  try {
    const existing = await findAddressById(id)
    // 他人のアドレスは 404 で隠蔽（OWASP A01）
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'アドレスが見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }
    const body: unknown = await req.json()
    const parsed = addressInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: '入力内容が正しくありません', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const updated = await updateAddress(id, session.user.id, parsed.data)
    return NextResponse.json({ address: updated })
  } catch (err) {
    console.error('[account/addresses/:id PATCH] エラー:', err)
    return NextResponse.json(
      { error: 'アドレス更新に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }
  const { id } = await params
  try {
    const existing = await findAddressById(id)
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'アドレスが見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }
    await deleteAddress(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[account/addresses/:id DELETE] エラー:', err)
    return NextResponse.json(
      { error: 'アドレス削除に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
