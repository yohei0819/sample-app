// アドレス帳バリデータのテスト（#134）
import { describe, expect, it } from 'vitest'
import { addressInputSchema } from './address'

const valid = {
  name: '山田太郎',
  postalCode: '100-0001',
  prefecture: '東京都',
  city: '千代田区',
  addressLine1: '1-1-1',
  addressLine2: '○○ビル101',
  phone: '03-1234-5678',
  isDefault: true,
}

describe('addressInputSchema', () => {
  it('有効な入力を受理する', () => {
    expect(addressInputSchema.safeParse(valid).success).toBe(true)
  })

  it('addressLine2 を省略可能', () => {
    const { addressLine2: _omit, ...rest } = valid
    void _omit
    expect(addressInputSchema.safeParse(rest).success).toBe(true)
  })

  it('addressLine2 が空文字の場合は undefined に変換される', () => {
    const result = addressInputSchema.safeParse({ ...valid, addressLine2: '' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.addressLine2).toBeUndefined()
    }
  })

  it('郵便番号がハイフンなしでも受理する', () => {
    expect(
      addressInputSchema.safeParse({ ...valid, postalCode: '1000001' }).success,
    ).toBe(true)
  })

  it('電話番号に英字を含むと拒否する', () => {
    expect(
      addressInputSchema.safeParse({ ...valid, phone: 'abc-1234' }).success,
    ).toBe(false)
  })

  it('name が空だと拒否する', () => {
    expect(addressInputSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })
})
