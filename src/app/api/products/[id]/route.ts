// 商品詳細 API Route Handler
import { NextRequest, NextResponse } from 'next/server'
import { findProductById } from '@/lib/db/products'

type RouteContext = {
  params: { id: string }
}

// GET /api/products/:id
export const GET = async (_request: NextRequest, { params }: RouteContext) => {
  try {
    const product = await findProductById(params.id)
    if (!product) {
      return NextResponse.json({ error: '商品が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: '商品の取得に失敗しました' }, { status: 500 })
  }
}
