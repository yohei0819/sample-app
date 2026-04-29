// 追加: 注文 Route Handler の Integration テスト
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/db/orders', () => ({
  createOrder: vi.fn(),
  findOrdersByUserId: vi.fn(),
}))
vi.mock('@/lib/db/products', () => ({
  validateCartItems: vi.fn(),
}))
vi.mock('@/lib/db/coupons', () => ({
  findCouponByCode: vi.fn(),
  incrementCouponUsedCountAtomic: vi.fn(),
}))
vi.mock('@/lib/db/sales', () => ({
  findActiveSalesForProducts: vi.fn().mockResolvedValue(new Map()),
}))
vi.mock('@/lib/email/sendOrderConfirmation', () => ({
  sendOrderConfirmationEmail: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/lib/rateLimit', () => ({
  enforceRateLimit: vi.fn().mockReturnValue(null),
}))
vi.mock('@/lib/emailVerificationGuard', () => ({
  isEmailVerified: vi.fn().mockResolvedValue(true),
}))

import { GET, POST } from './route'
import { auth } from '@/lib/auth'
import { findOrdersByUserId, createOrder } from '@/lib/db/orders'
import { validateCartItems } from '@/lib/db/products'

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/orders', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })

describe('GET /api/orders', () => {
  beforeEach(() => vi.clearAllMocks())

  it('未認証時は 401 を返す', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('認証済みなら注文一覧を返す', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as never)
    vi.mocked(findOrdersByUserId).mockResolvedValue([{ id: 'o1' }] as never)
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.orders).toHaveLength(1)
  })
})

describe('POST /api/orders', () => {
  beforeEach(() => vi.clearAllMocks())

  it('未認証時は 401 を返す', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)
    const res = await POST(makeRequest({ items: [{ id: 'p1', quantity: 1 }] }))
    expect(res.status).toBe(401)
  })

  it('items 不正で 400 を返す', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as never)
    const res = await POST(makeRequest({ items: [] }))
    expect(res.status).toBe(400)
  })

  it('正常系: 注文を作成し 201 相当を返す', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as never)
    vi.mocked(validateCartItems).mockResolvedValue([
      { product: { id: 'p1', price: 1000, stock: 10, name: 'P' }, quantity: 2 },
    ] as never)
    vi.mocked(createOrder).mockResolvedValue({ id: 'o1' } as never)

    const res = await POST(
      makeRequest({
        items: [{ id: 'p1', quantity: 2 }],
        shippingAddress: {
          postalCode: '100-0001',
          prefecture: '東京都',
          city: '千代田区',
          address: '1-1',
          name: 'Test',
          phone: '09000000000',
        },
        stripePaymentIntentId: 'pi_test',
      }),
    )
    expect([200, 201]).toContain(res.status)
    expect(createOrder).toHaveBeenCalledOnce()
  })
})
