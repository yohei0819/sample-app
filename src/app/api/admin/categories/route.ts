// 管理画面 カテゴリ一覧・作成 API
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { findAllCategoriesWithCount, createCategory } from '@/lib/db/categories'
import { PrismaClientKnownRequestError } from '@/generated/prisma/internal/prismaNamespace'
import { categorySchema } from '@/lib/validators/category'

// GET /api/admin/categories - カテゴリ一覧取得
export const GET = async () => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  try {
    const categories = await findAllCategoriesWithCount()
    return NextResponse.json({ categories })
  } catch (err) {
    console.error('[admin/categories GET] エラー:', err)
    return NextResponse.json(
      { error: 'カテゴリ一覧の取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    )
  }
}

// POST /api/admin/categories - カテゴリ作成
export const POST = async (req: NextRequest) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  try {
    const body: unknown = await req.json()
    const parsed = categorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: '入力内容に誤りがあります', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const category = await createCategory(parsed.data)
    return NextResponse.json({ category }, { status: 201 })
  } catch (err) {
    // 修正: slug ユニーク制約違反（P2002）を 409 で返す
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json(
        { error: 'このスラッグは既に使用されています', code: 'CONFLICT' },
        { status: 409 }
      )
    }
    console.error('[admin/categories POST] エラー:', err)
    return NextResponse.json(
      { error: 'カテゴリの作成に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    )
  }
}
