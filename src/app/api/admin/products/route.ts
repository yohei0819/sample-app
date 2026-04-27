// 管理画面 商品一覧・作成 API
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { findAllCategories } from '@/lib/db/categories'
import { createProduct, findAllProductsForAdmin } from '@/lib/db/products'
import { productSchema } from '@/lib/validators/product'

// GET /api/admin/products - 商品一覧取得
export const GET = async (req: NextRequest) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { searchParams } = req.nextUrl
  const search = searchParams.get('search') ?? undefined
  const take = Number(searchParams.get('take') ?? 50)
  const skip = Number(searchParams.get('skip') ?? 0)

  try {
    const [products, categories] = await Promise.all([
      findAllProductsForAdmin({ search, take, skip }),
      findAllCategories(),
    ])
    return NextResponse.json({ products, categories })
  } catch (err) {
    console.error('[admin/products GET] エラー:', err)
    return NextResponse.json({ error: '商品一覧の取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}

// POST /api/admin/products - 商品作成
export const POST = async (req: NextRequest) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  try {
    const body: unknown = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: '入力内容に誤りがあります', details: parsed.error.flatten() }, { status: 400 })
    }

    const { name, description, price, stock, categoryId, isPublished } = parsed.data
    const product = await createProduct({
      name,
      description,
      price,
      stock,
      isPublished,
      // TODO: 画像アップロード対応（Cloudinary or Vercel Blob）は未実装
      images: [],
      ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
    })
    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    console.error('[admin/products POST] エラー:', err)
    return NextResponse.json({ error: '商品の作成に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
