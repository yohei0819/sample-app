// 商品一覧 API Route Handler
import { NextRequest, NextResponse } from 'next/server'
import { findProducts } from '@/lib/db/products'
import type { Prisma } from '@/generated/prisma/client'

// GET /api/products?search=&categoryId=&sort=newest|price_asc|price_desc&take=&skip=
export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search') ?? undefined
    const categoryId = searchParams.get('categoryId') ?? undefined
    const sort = searchParams.get('sort') ?? 'newest'
    // 変更: NaN・負値を安全なデフォルト値に fallback する
    const rawTake = Number(searchParams.get('take') ?? '20')
    const rawSkip = Number(searchParams.get('skip') ?? '0')
    const take = Number.isFinite(rawTake) && rawTake > 0 ? Math.floor(rawTake) : 20
    const skip = Number.isFinite(rawSkip) && rawSkip >= 0 ? Math.floor(rawSkip) : 0

    const orderByMap: Record<string, Prisma.ProductOrderByWithRelationInput> = {
      newest: { createdAt: 'desc' },
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
    }
    const orderBy = orderByMap[sort] ?? { createdAt: 'desc' }

    const products = await findProducts({ search, categoryId, take, skip, orderBy })
    return NextResponse.json(products)
  } catch {
    return NextResponse.json({ error: '商品の取得に失敗しました' }, { status: 500 })
  }
}
