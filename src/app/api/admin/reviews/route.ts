import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { countAllReviews, findAllReviewsForAdmin } from '@/lib/db/reviews'

// GET /api/admin/reviews - レビュー一覧取得（管理画面用）
export const GET = async (req: NextRequest) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { searchParams } = req.nextUrl
  const isPublicParam = searchParams.get('isPublic')
  const take = Math.min(Number(searchParams.get('take') ?? 20), 100)
  const skip = Number(searchParams.get('skip') ?? 0)

  const isPublic =
    isPublicParam === 'true' ? true : isPublicParam === 'false' ? false : undefined

  try {
    const [reviews, total] = await Promise.all([
      findAllReviewsForAdmin({ isPublic, take, skip }),
      countAllReviews({ isPublic }),
    ])
    return NextResponse.json({ reviews, total })
  } catch (err) {
    console.error('[admin/reviews GET] エラー:', err)
    return NextResponse.json(
      { error: 'レビュー一覧の取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
