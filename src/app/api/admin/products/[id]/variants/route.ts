// 追加 (#131): 管理画面 商品バリエーション一覧取得・作成 API
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { findProductByIdForAdmin } from '@/lib/db/products'
import {
  createVariant,
  findVariantBySku,
  findVariantsByProductId,
} from '@/lib/db/productVariants'
import { productVariantCreateSchema } from '@/lib/validators/productVariant'

// GET /api/admin/products/[id]/variants - 商品の variant 一覧
export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { id } = await params
  const product = await findProductByIdForAdmin(id)
  if (!product) {
    return NextResponse.json({ error: '商品が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
  }

  const variants = await findVariantsByProductId(id)
  return NextResponse.json({ variants })
}

// POST /api/admin/products/[id]/variants - variant 新規作成
export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { id } = await params
  const product = await findProductByIdForAdmin(id)
  if (!product) {
    return NextResponse.json({ error: '商品が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
  }

  try {
    const body: unknown = await req.json()
    const parsed = productVariantCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: '入力内容に誤りがあります', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    // SKU 重複チェック
    const duplicate = await findVariantBySku(parsed.data.sku)
    if (duplicate) {
      return NextResponse.json(
        { error: '同一 SKU が既に存在します', code: 'SKU_CONFLICT' },
        { status: 409 },
      )
    }

    const variant = await createVariant({
      productId: id,
      sku: parsed.data.sku,
      attributes: parsed.data.attributes,
      priceDelta: parsed.data.priceDelta,
      stock: parsed.data.stock,
    })
    return NextResponse.json({ variant }, { status: 201 })
  } catch (err) {
    console.error('[admin/products/variants POST] エラー:', err)
    return NextResponse.json(
      { error: 'バリエーションの作成に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
