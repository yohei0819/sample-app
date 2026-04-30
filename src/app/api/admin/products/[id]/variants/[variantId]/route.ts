// 追加 (#131): 管理画面 商品バリエーション 個別更新・削除 API
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import {
  deleteVariant,
  findVariantById,
  findVariantBySku,
  updateVariant,
} from '@/lib/db/productVariants'
import { productVariantUpdateSchema } from '@/lib/validators/productVariant'

// PATCH /api/admin/products/[id]/variants/[variantId]
export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> },
) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { id, variantId } = await params
  const existing = await findVariantById(variantId)
  if (!existing || existing.productId !== id) {
    return NextResponse.json(
      { error: 'バリエーションが見つかりません', code: 'NOT_FOUND' },
      { status: 404 },
    )
  }

  try {
    const body: unknown = await req.json()
    const parsed = productVariantUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: '入力内容に誤りがあります', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    // SKU を変更する場合は重複チェック
    if (parsed.data.sku && parsed.data.sku !== existing.sku) {
      const duplicate = await findVariantBySku(parsed.data.sku)
      if (duplicate) {
        return NextResponse.json(
          { error: '同一 SKU が既に存在します', code: 'SKU_CONFLICT' },
          { status: 409 },
        )
      }
    }

    const variant = await updateVariant(variantId, parsed.data)
    return NextResponse.json({ variant })
  } catch (err) {
    console.error('[admin/products/variants PATCH] エラー:', err)
    return NextResponse.json(
      { error: 'バリエーションの更新に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}

// DELETE /api/admin/products/[id]/variants/[variantId]
export const DELETE = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> },
) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { id, variantId } = await params
  const existing = await findVariantById(variantId)
  if (!existing || existing.productId !== id) {
    return NextResponse.json(
      { error: 'バリエーションが見つかりません', code: 'NOT_FOUND' },
      { status: 404 },
    )
  }

  try {
    await deleteVariant(variantId)
    return NextResponse.json({ message: 'バリエーションを削除しました' })
  } catch (err) {
    console.error('[admin/products/variants DELETE] エラー:', err)
    return NextResponse.json(
      { error: 'バリエーションの削除に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
