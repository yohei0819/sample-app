// 追加 (#132): レビュー有用性投票 Route Handler のテスト
import { NextRequest } from 'next/server'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PrismaClientKnownRequestError } from '@/generated/prisma/internal/prismaNamespace'
import { auth } from '@/lib/auth'
import {
  countReviewVotes,
  createReviewVote,
  deleteReviewVote,
  findReviewOwner,
} from '@/lib/db/reviews'
import { POST, DELETE } from './route'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

vi.mock('@/lib/db/reviews', () => ({
  findReviewOwner: vi.fn(),
  createReviewVote: vi.fn(),
  deleteReviewVote: vi.fn(),
  countReviewVotes: vi.fn(),
}))

// レート制限はテストでは常に通過させる
vi.mock('@/lib/rateLimit', () => ({
  enforceRateLimit: vi.fn().mockReturnValue(null),
}))

const makeReq = (method: 'POST' | 'DELETE') =>
  new NextRequest('http://localhost/api/reviews/votes/r1', { method })

const params = { params: Promise.resolve({ reviewId: 'r1' }) }

describe('POST /api/reviews/votes/[reviewId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('未ログインなら 401', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)
    const res = await POST(makeReq('POST'), params)
    expect(res.status).toBe(401)
  })

  it('レビューが存在しない場合 404', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as never)
    vi.mocked(findReviewOwner).mockResolvedValue(null)
    const res = await POST(makeReq('POST'), params)
    expect(res.status).toBe(404)
  })

  it('自分のレビューには投票できず 403', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as never)
    vi.mocked(findReviewOwner).mockResolvedValue({
      id: 'r1',
      userId: 'u1',
      isPublic: true,
    } as never)
    const res = await POST(makeReq('POST'), params)
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.code).toBe('SELF_VOTE_FORBIDDEN')
    expect(createReviewVote).not.toHaveBeenCalled()
  })

  it('正常系: 他人のレビューには投票でき 201 と count を返す', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u2' } } as never)
    vi.mocked(findReviewOwner).mockResolvedValue({
      id: 'r1',
      userId: 'u1',
      isPublic: true,
    } as never)
    vi.mocked(createReviewVote).mockResolvedValue({} as never)
    vi.mocked(countReviewVotes).mockResolvedValue(1)
    const res = await POST(makeReq('POST'), params)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json).toEqual({ voted: true, count: 1 })
  })

  it('重複投票（P2002）は 409 を返し冪等', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u2' } } as never)
    vi.mocked(findReviewOwner).mockResolvedValue({
      id: 'r1',
      userId: 'u1',
      isPublic: true,
    } as never)
    const dupErr = Object.create(PrismaClientKnownRequestError.prototype) as PrismaClientKnownRequestError
    Object.assign(dupErr, { code: 'P2002', message: 'dup', clientVersion: '0' })
    vi.mocked(createReviewVote).mockRejectedValue(dupErr)
    vi.mocked(countReviewVotes).mockResolvedValue(1)
    const res = await POST(makeReq('POST'), params)
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.voted).toBe(true)
    expect(json.count).toBe(1)
  })
})

describe('DELETE /api/reviews/votes/[reviewId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('未ログインなら 401', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)
    const res = await DELETE(makeReq('DELETE'), params)
    expect(res.status).toBe(401)
  })

  it('正常系: 投票取り消し後の count を返す（未投票でも 200）', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u2' } } as never)
    vi.mocked(deleteReviewVote).mockResolvedValue({ count: 0 } as never)
    vi.mocked(countReviewVotes).mockResolvedValue(0)
    const res = await DELETE(makeReq('DELETE'), params)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ voted: false, count: 0 })
  })

  it('toggle: POST 後 DELETE で投票数が増減する', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u2' } } as never)
    vi.mocked(findReviewOwner).mockResolvedValue({
      id: 'r1',
      userId: 'u1',
      isPublic: true,
    } as never)
    vi.mocked(createReviewVote).mockResolvedValue({} as never)
    vi.mocked(deleteReviewVote).mockResolvedValue({ count: 1 } as never)
    vi.mocked(countReviewVotes).mockResolvedValueOnce(1).mockResolvedValueOnce(0)

    const post = await POST(makeReq('POST'), params)
    expect(post.status).toBe(201)
    expect((await post.json()).count).toBe(1)

    const del = await DELETE(makeReq('DELETE'), params)
    expect(del.status).toBe(200)
    expect((await del.json()).count).toBe(0)
  })
})
