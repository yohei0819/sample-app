// アドレス帳 API（#134）一覧取得 + 新規作成
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  createAddress,
  findAddressesByUserId,
} from '@/lib/db/addresses'
import { addressInputSchema } from '@/lib/validators/address'

export const GET = async () => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }
  try {
    const addresses = await findAddressesByUserId(session.user.id)
    return NextResponse.json({ addresses })
  } catch (err) {
    console.error('[account/addresses GET] エラー:', err)
    return NextResponse.json(
      { error: 'アドレス取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}

export const POST = async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }
  try {
    const body: unknown = await req.json()
    const parsed = addressInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: '入力内容が正しくありません', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const created = await createAddress(session.user.id, parsed.data)
    return NextResponse.json({ address: created }, { status: 201 })
  } catch (err) {
    console.error('[account/addresses POST] エラー:', err)
    return NextResponse.json(
      { error: 'アドレス作成に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
