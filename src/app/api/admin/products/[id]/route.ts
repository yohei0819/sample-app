// 管理画面 商品更新・削除 API
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { deleteProduct, findProductByIdForAdmin, updateProduct } from '@/lib/db/products'
import { productSchema } from '@/lib/validators/product'

// PUT /api/admin/products/[id] - 商品更新
export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const existing = await findProductByIdForAdmin(params.id)
  if (!existing) {
    return NextResponse.json({ error: '商品が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
  }

  try {
    const body: unknown = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: '入力内容に誤りがあります', details: parsed.error.flatten() }, { status: 400 })
    }

    const { name, description, price, stock, categoryId, isPublished } = parsed.data
    const product = await updateProduct(params.id, {
      name,
      description,
      price,
      stock,
      isPublished,
      // TODO: 画像アップロード対応（Cloudinary or Vercel Blob）は未実装
      ...(categoryId !== undefined
        ? { category: categoryId ? { connect: { id: categoryId } } : { disconnect: true } }
        : {}),
    })
    return NextResponse.json({ product })
  } catch (err) {
    console.error('[admin/products PUT] エラー:', err)
    return NextResponse.json({ error: '商品の更新に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}

// DELETE /api/admin/products/[id] - 商品削除
export const DELETE = async (
  _req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const existing = await findProductByIdForAdmin(params.id)
  if (!existing) {
    return NextResponse.json({ error: '商品が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
  }

  try {
    await deleteProduct(params.id)
    return NextResponse.json({ message: '商品を削除しました' })
  } catch (err) {
    console.error('[admin/products DELETE] エラー:', err)
    return NextResponse.json({ error: '商品の削除に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
