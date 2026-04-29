// パスワードリセットの Zod スキーマテスト（#129）
import { describe, expect, it } from 'vitest'
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth'

describe('forgotPasswordSchema', () => {
  it('正しいメールアドレスを受理する', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' })
    expect(result.success).toBe(true)
  })

  it('不正なメールアドレスを拒否する', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'not-email' })
    expect(result.success).toBe(false)
  })

  it('email が空の場合は拒否する', () => {
    const result = forgotPasswordSchema.safeParse({ email: '' })
    expect(result.success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('正しい token と password を受理する', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'abc123',
      password: 'password1234',
    })
    expect(result.success).toBe(true)
  })

  it('token が空の場合は拒否する', () => {
    const result = resetPasswordSchema.safeParse({
      token: '',
      password: 'password1234',
    })
    expect(result.success).toBe(false)
  })

  it('password が短すぎる場合は拒否する', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'abc',
      password: 'short',
    })
    expect(result.success).toBe(false)
  })
})
