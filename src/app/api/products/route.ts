// 商品一覧 API Route Handler
import { NextRequest, NextResponse } from 'next/server'
import { findProducts } from '@/lib/db/products'
import type { Prisma } from '@/generated/prisma/client'
// 追加: ページネーション定数をインポート
import { MAX_TAKE, DEFAULT_TAKE, DEFAULT_SKIP } from '@/constants/pagination'

// GET /api/products?search=&categoryId=&sort=newest|price_asc|price_desc&take=&skip=
export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search') ?? undefined
    const categoryId = searchParams.get('categoryId') ?? undefined
    const sort = searchParams.get('sort') ?? 'newest'
    // 変更: NaN・負値・上限超過を安全なデフォルト値に fallback する
    const rawTake = Number(searchParams.get('take') ?? String(DEFAULT_TAKE))
    const rawSkip = Number(searchParams.get('skip') ?? String(DEFAULT_SKIP))
    // 変更: MAX_TAKEで上限を設けてDoS起点になり得る過大なクエリを防ぐ
    const take = Number.isFinite(rawTake) && rawTake > 0 ? Math.min(Math.floor(rawTake), MAX_TAKE) : DEFAULT_TAKE
    const skip = Number.isFinite(rawSkip) && rawSkip >= 0 ? Math.floor(rawSkip) : DEFAULT_SKIP

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
