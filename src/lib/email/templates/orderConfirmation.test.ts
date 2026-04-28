// 注文確認メールテンプレートのユニットテスト
import { describe, expect, it } from 'vitest'
import { renderOrderConfirmationHtml } from './orderConfirmation'

const baseAddress = {
  name: '山田太郎',
  postalCode: '100-0001',
  prefecture: '東京都',
  city: '千代田区',
  addressLine1: '千代田1-1',
  phone: '03-0000-0000',
}

describe('renderOrderConfirmationHtml', () => {
  it('注文番号・合計金額・商品名がHTMLに含まれる', () => {
    const html = renderOrderConfirmationHtml(
      { id: 'order_123', totalPrice: 12345, shippingAddress: baseAddress },
      [{ productName: 'テスト商品', quantity: 2, unitPrice: 5000 }],
    )
    expect(html).toContain('order_123')
    expect(html).toContain('¥12,345')
    expect(html).toContain('テスト商品')
  })

  it('商品名に <script> が含まれていてもエスケープされる', () => {
    const html = renderOrderConfirmationHtml(
      { id: 'order_xss', totalPrice: 100, shippingAddress: baseAddress },
      [{ productName: '<script>alert(1)</script>', quantity: 1, unitPrice: 100 }],
    )
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
  })
})
