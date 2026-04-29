// 追加 (#104): 検索サジェスト Route Handler
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { findProductSuggestions } from '@/lib/db/products'
import { enforceRateLimit } from '@/lib/rateLimit'
import {
  SEARCH_SUGGEST_LIMIT,
  SEARCH_SUGGEST_MIN_QUERY_LENGTH,
} from '@/constants/search'

const querySchema = z.object({
  q: z.string().min(SEARCH_SUGGEST_MIN_QUERY_LENGTH).max(100),
})

export const GET = async (req: Request) => {
  // レート制限（軽量だが連打されやすいため）
  const limited = enforceRateLimit('SEARCH_SUGGEST', req)
  if (limited) return limited

  const { searchParams } = new URL(req.url)
  const parsed = querySchema.safeParse({ q: searchParams.get('q') ?? '' })
  if (!parsed.success) {
    return NextResponse.json({ suggestions: [] })
  }

  const suggestions = await findProductSuggestions({
    query: parsed.data.q,
    limit: SEARCH_SUGGEST_LIMIT,
  })
  return NextResponse.json({ suggestions })
}
