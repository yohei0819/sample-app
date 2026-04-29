// buildDiff の単体テスト（#121）
import { describe, it, expect } from 'vitest'
import { buildDiff } from '@/lib/audit'

describe('buildDiff', () => {
  it('変更されたフィールドのみを抽出する', () => {
    const result = buildDiff(
      { name: 'A', price: 100, stock: 5 },
      { name: 'B', price: 100, stock: 3 },
    )
    expect(result.before).toEqual({ name: 'A', stock: 5 })
    expect(result.after).toEqual({ name: 'B', stock: 3 })
  })

  it('追加されたフィールドは after にのみ含まれる', () => {
    const result = buildDiff({ name: 'A' }, { name: 'A', description: 'X' })
    expect(result.before).toEqual({})
    expect(result.after).toEqual({ description: 'X' })
  })

  it('before が null の場合は after の全フィールドを返す', () => {
    const result = buildDiff(null, { name: 'A', price: 100 })
    expect(result.before).toEqual({})
    expect(result.after).toEqual({ name: 'A', price: 100 })
  })

  it('変更がない場合は空オブジェクトを返す', () => {
    const result = buildDiff({ name: 'A' }, { name: 'A' })
    expect(result.before).toEqual({})
    expect(result.after).toEqual({})
  })
})
