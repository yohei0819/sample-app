// 追加: 会員登録 Route Handler の Integration テスト
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// 依存モック
vi.mock('@/lib/db/users', () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
}))
vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn().mockResolvedValue('hashed') },
}))
vi.mock('@/lib/rateLimit', () => ({
  enforceRateLimit: vi.fn().mockReturnValue(null),
}))
vi.mock('@/lib/db/emailVerificationTokens', () => ({
  issueEmailVerificationToken: vi.fn().mockResolvedValue({ token: 'tok', expiresAt: new Date() }),
}))
vi.mock('@/lib/email/sendEmailVerification', () => ({
  sendEmailVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
}))

import { POST } from './route'
import { findUserByEmail, createUser } from '@/lib/db/users'
import { enforceRateLimit } from '@/lib/rateLimit'

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(enforceRateLimit).mockReturnValue(null)
  })

  it('正常系: 201 を返し、ユーザーを作成する', async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(null)
    vi.mocked(createUser).mockResolvedValue({ id: 'u1' } as never)

    const res = await POST(
      makeRequest({ email: 'test@example.com', name: 'Test', password: 'password123' }),
    )
    expect(res.status).toBe(201)
    expect(createUser).toHaveBeenCalledOnce()
  })

  it('バリデーションエラー: 不正な入力で 400 を返す', async () => {
    const res = await POST(makeRequest({ email: 'invalid', name: '', password: '1' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.code).toBe('VALIDATION_ERROR')
  })

  it('重複エラー: 既存メールで 409 を返す', async () => {
    vi.mocked(findUserByEmail).mockResolvedValue({ id: 'u1' } as never)
    const res = await POST(
      makeRequest({ email: 'dup@example.com', name: 'Test', password: 'password123' }),
    )
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.code).toBe('EMAIL_ALREADY_EXISTS')
  })

  it('レート制限: 制限超過で enforceRateLimit のレスポンスを返す', async () => {
    const limitRes = new Response(JSON.stringify({ error: 'rate limit' }), { status: 429 })
    vi.mocked(enforceRateLimit).mockReturnValue(limitRes as never)
    const res = await POST(
      makeRequest({ email: 'test@example.com', name: 'Test', password: 'password123' }),
    )
    expect(res.status).toBe(429)
  })
})
