// applyTemplateVariables のユニットテスト
import { describe, expect, it } from 'vitest'
import { applyTemplateVariables } from './templateEngine'

describe('applyTemplateVariables', () => {
  it('単一の変数を置換する', () => {
    expect(applyTemplateVariables('Hello {{name}}', { name: '太郎' })).toBe('Hello 太郎')
  })

  it('複数の変数を置換する', () => {
    const tpl = '注文番号: {{orderNumber}} / 顧客: {{customerName}} / 合計: {{totalAmount}}'
    const result = applyTemplateVariables(tpl, {
      orderNumber: 'ORD-001',
      customerName: '山田',
      totalAmount: 1980,
    })
    expect(result).toBe('注文番号: ORD-001 / 顧客: 山田 / 合計: 1980')
  })

  it('同じ変数が複数回出現してもすべて置換する', () => {
    expect(applyTemplateVariables('{{x}} と {{x}}', { x: 'A' })).toBe('A と A')
  })

  it('未指定の変数はプレースホルダーのまま残す', () => {
    expect(applyTemplateVariables('{{a}} {{b}}', { a: 'A' })).toBe('A {{b}}')
  })

  it('null や undefined の値はプレースホルダーのまま残す', () => {
    expect(applyTemplateVariables('{{a}} {{b}}', { a: null, b: undefined })).toBe('{{a}} {{b}}')
  })

  it('変数が含まれていない文字列はそのまま返す', () => {
    expect(applyTemplateVariables('変数なし', {})).toBe('変数なし')
  })

  it('プレースホルダー前後の空白を許容する', () => {
    expect(applyTemplateVariables('{{ name }}', { name: '太郎' })).toBe('太郎')
  })

  it('数値を文字列に変換して置換する', () => {
    expect(applyTemplateVariables('価格 {{price}}円', { price: 100 })).toBe('価格 100円')
  })

  it('値に含まれるHTMLはそのまま埋め込む（呼び出し側で事前エスケープする想定）', () => {
    // テンプレートエンジン自体はエスケープしない（itemsHtml などHTML注入を許容するため）
    // XSSを避けたい変数は呼び出し側で事前にescapeHtml()してから渡すルール
    const result = applyTemplateVariables('<p>{{content}}</p>', {
      content: '<script>alert(1)</script>',
    })
    expect(result).toBe('<p><script>alert(1)</script></p>')
  })

  it('値内の "$" などの正規表現特殊文字を破壊しない', () => {
    expect(applyTemplateVariables('{{v}}', { v: '$1 & $2' })).toBe('$1 & $2')
  })

  it('プレースホルダー名と一致しないキーは無視する', () => {
    expect(applyTemplateVariables('{{a}}', { other: 'X' })).toBe('{{a}}')
  })
})
