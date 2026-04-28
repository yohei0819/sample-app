// 追加: csv ユーティリティの単体テスト
import { describe, it, expect } from 'vitest'
import { toCsv, toCsvWithBom } from './csv'

describe('toCsv', () => {
  it('ヘッダと行を CRLF で結合する', () => {
    const csv = toCsv(['id', 'name'], [['1', 'foo']])
    expect(csv).toBe('id,name\r\n1,foo')
  })

  it('カンマ・改行・ダブルクォートを含む値はエスケープされる', () => {
    const csv = toCsv(['a'], [['x,y'], ['z\n"q"']])
    expect(csv).toBe('a\r\n"x,y"\r\n"z\n""q"""')
  })

  it('null / undefined は空文字に変換される', () => {
    const csv = toCsv(['a', 'b'], [[null, undefined]])
    expect(csv).toBe('a,b\r\n,')
  })

  it('数値は文字列化される', () => {
    const csv = toCsv(['n'], [[1234]])
    expect(csv).toBe('n\r\n1234')
  })
})

describe('toCsvWithBom', () => {
  it('UTF-8 BOM を先頭に付与する', () => {
    const buf = toCsvWithBom(['a'], [['日本語']])
    expect(buf[0]).toBe(0xef)
    expect(buf[1]).toBe(0xbb)
    expect(buf[2]).toBe(0xbf)
    expect(buf.subarray(3).toString('utf-8')).toBe('a\r\n日本語')
  })
})
