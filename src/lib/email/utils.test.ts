// メールユーティリティのユニットテスト
import { describe, expect, it } from 'vitest'
import { escapeHtml } from './utils'

describe('escapeHtml', () => {
  it('通常の文字列はそのまま返す', () => {
    expect(escapeHtml('こんにちは Hello 123')).toBe('こんにちは Hello 123')
  })

  it('空文字を渡すと空文字が返る', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('<script>タグをエスケープする', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    )
  })

  it('& < > " \' を個別にエスケープする', () => {
    expect(escapeHtml('&')).toBe('&amp;')
    expect(escapeHtml('<')).toBe('&lt;')
    expect(escapeHtml('>')).toBe('&gt;')
    expect(escapeHtml('"')).toBe('&quot;')
    expect(escapeHtml("'")).toBe('&#39;')
  })

  it('&は最初に1度だけ置換される（二重エスケープしない）', () => {
    // 入力 "&lt;" が "&amp;lt;" に変換されることを確認（&のみが置換対象）
    expect(escapeHtml('&lt;')).toBe('&amp;lt;')
  })

  it('複数の特殊文字が混ざった文字列を全てエスケープする', () => {
    expect(escapeHtml(`Tom & Jerry's "show" <b>`)).toBe(
      'Tom &amp; Jerry&#39;s &quot;show&quot; &lt;b&gt;',
    )
  })
})
