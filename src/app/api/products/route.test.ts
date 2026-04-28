// 追加: 商品 Route Handler の Integration テスト
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db/products', () => ({
  findProducts: vi.fn(),
}))

import { GET } from './route'
import { findProducts } from '@/lib/db/products'

const makeRequest = (url: string) => new NextRequest(url)

describe('GET /api/products', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('正常系: クエリ無しでデフォルト件数の商品一覧を返す', async () => {
    vi.mocked(findProducts).mockResolvedValue([{ id: 'p1' }] as never)
    const res = await GET(makeRequest('http://localhost/api/products'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveLength(1)
    expect(findProducts).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
    )
  })

  it('search・sort=price_asc クエリが正しく渡る', async () => {
    vi.mocked(findProducts).mockResolvedValue([] as never)
    await GET(makeRequest('http://localhost/api/products?search=foo&sort=price_asc'))
    expect(findProducts).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'foo', orderBy: { price: 'asc' } }),
    )
  })

  it('take の上限超過は MAX_TAKE に丸められる', async () => {
    vi.mocked(findProducts).mockResolvedValue([] as never)
    await GET(makeRequest('http://localhost/api/products?take=99999'))
    const call = vi.mocked(findProducts).mock.calls[0][0]
    expect(call.take).toBeLessThanOrEqual(100)
  })

  it('DBエラー時は 500 を返す', async () => {
    vi.mocked(findProducts).mockRejectedValue(new Error('boom'))
    const res = await GET(makeRequest('http://localhost/api/products'))
    expect(res.status).toBe(500)
  })
})
