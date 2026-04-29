// 商品詳細 API Route Handler
import { NextRequest, NextResponse } from 'next/server'
import { findProductById } from '@/lib/db/products'

type RouteContext = {
  // 変更: Next.js 15 の非同期 params
  params: Promise<{ id: string }>
}

// GET /api/products/:id
export const GET = async (_request: NextRequest, { params }: RouteContext) => {
  try {
    const { id } = await params // 変更
    const product = await findProductById(id)
    if (!product) {
      return NextResponse.json({ error: '商品が見つかりません', code: 'NOT_FOUND' }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: '商品の取得に失敗しました' }, { status: 500 })
  }
}
