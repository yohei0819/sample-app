import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { deleteReview, findReviewById, updateReviewVisibility } from '@/lib/db/reviews'

const patchSchema = z.object({
  isPublic: z.boolean(),
})

// PATCH /api/admin/reviews/[id] - 公開/非公開切替
export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { id } = await params

  const existing = await findReviewById(id)
  if (!existing) {
    return NextResponse.json({ error: 'レビューが見つかりません', code: 'NOT_FOUND' }, { status: 404 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です', code: 'BAD_REQUEST' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: '入力値が不正です', code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  try {
    const review = await updateReviewVisibility(id, parsed.data.isPublic)
    return NextResponse.json({ review })
  } catch (err) {
    console.error('[admin/reviews PATCH] エラー:', err)
    return NextResponse.json(
      { error: 'レビューの更新に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}

// DELETE /api/admin/reviews/[id] - レビュー削除
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { id } = await params

  const existing = await findReviewById(id)
  if (!existing) {
    return NextResponse.json({ error: 'レビューが見つかりません', code: 'NOT_FOUND' }, { status: 404 })
  }

  try {
    await deleteReview(id)
    return NextResponse.json({ message: 'レビューを削除しました' })
  } catch (err) {
    console.error('[admin/reviews DELETE] エラー:', err)
    return NextResponse.json(
      { error: 'レビューの削除に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
