import { describe, it, expect, beforeEach } from 'vitest'
import {
  checkRateLimit,
  enforceRateLimit,
  getClientIdentifier,
  __resetRateLimitForTest,
} from './rateLimit'

describe('rateLimit', () => {
  beforeEach(() => {
    __resetRateLimitForTest()
  })

  describe('checkRateLimit', () => {
    it('上限内であれば true を返す', () => {
      expect(checkRateLimit('test', 3, 60_000)).toBe(true)
      expect(checkRateLimit('test', 3, 60_000)).toBe(true)
      expect(checkRateLimit('test', 3, 60_000)).toBe(true)
    })

    it('上限を超えると false を返す', () => {
      checkRateLimit('test', 2, 60_000)
      checkRateLimit('test', 2, 60_000)
      expect(checkRateLimit('test', 2, 60_000)).toBe(false)
    })

    it('キーが異なれば独立してカウントされる', () => {
      checkRateLimit('a', 1, 60_000)
      expect(checkRateLimit('a', 1, 60_000)).toBe(false)
      expect(checkRateLimit('b', 1, 60_000)).toBe(true)
    })
  })

  describe('getClientIdentifier', () => {
    it('x-forwarded-for ヘッダの先頭を返す', () => {
      const req = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
      })
      expect(getClientIdentifier(req)).toBe('1.2.3.4')
    })

    it('x-real-ip ヘッダがあればそれを返す', () => {
      const req = new Request('http://localhost', {
        headers: { 'x-real-ip': '9.9.9.9' },
      })
      expect(getClientIdentifier(req)).toBe('9.9.9.9')
    })

    it('ヘッダがなければ anonymous を返す', () => {
      const req = new Request('http://localhost')
      expect(getClientIdentifier(req)).toBe('anonymous')
    })
  })

  describe('enforceRateLimit', () => {
    it('上限内なら null を返す', () => {
      const req = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '1.1.1.1' },
      })
      expect(enforceRateLimit('AUTH_REGISTER', req)).toBeNull()
    })

    it('上限超過時は 429 NextResponse を返す', () => {
      const req = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '2.2.2.2' },
      })
      // AUTH_REGISTER の上限は 5
      for (let i = 0; i < 5; i += 1) {
        enforceRateLimit('AUTH_REGISTER', req)
      }
      const res = enforceRateLimit('AUTH_REGISTER', req)
      expect(res).not.toBeNull()
      expect(res?.status).toBe(429)
      expect(res?.headers.get('Retry-After')).toBeTruthy()
    })
  })
})
