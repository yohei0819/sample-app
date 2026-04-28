// 管理画面 カテゴリ更新・削除 API
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { findCategoryById, updateCategory, deleteCategory } from '@/lib/db/categories'
import { categorySchema } from '@/lib/validators/category'

type Params = { params: Promise<{ id: string }> }

// PUT /api/admin/categories/[id] - カテゴリ更新
export const PUT = async (req: NextRequest, { params }: Params) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { id } = await params

  try {
    const existing = await findCategoryById(id)
    if (!existing) {
      return NextResponse.json({ error: 'カテゴリが見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }

    const body: unknown = await req.json()
    const parsed = categorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: '入力内容に誤りがあります', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const category = await updateCategory(id, parsed.data)
    return NextResponse.json({ category })
  } catch (err) {
    console.error('[admin/categories PUT] エラー:', err)
    return NextResponse.json(
      { error: 'カテゴリの更新に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/categories/[id] - カテゴリ削除
export const DELETE = async (_req: NextRequest, { params }: Params) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { id } = await params

  try {
    const existing = await findCategoryById(id)
    if (!existing) {
      return NextResponse.json({ error: 'カテゴリが見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }

    await deleteCategory(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/categories DELETE] エラー:', err)
    return NextResponse.json(
      { error: 'カテゴリの削除に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    )
  }
}
