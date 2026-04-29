import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { removeProductFromWishlist, isProductInWishlist } from '@/lib/db/wishlist'
import { logger } from '@/lib/logger' // 追加

// DELETE /api/wishlist/[productId] - ウィッシュリストから商品削除（要認証）
export const DELETE = async (
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) => {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'ログインが必要です', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
  }

  const { productId } = await params
  const userId = session.user.id

  try {
    // 登録確認
    const exists = await isProductInWishlist(userId, productId)
    if (!exists) {
      return NextResponse.json(
        { error: 'ウィッシュリストに登録されていません', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }

    await removeProductFromWishlist(userId, productId)
    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error('[wishlist DELETE] エラー', { err }) // 変更
    return NextResponse.json(
      { error: 'ウィッシュリストからの削除に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
