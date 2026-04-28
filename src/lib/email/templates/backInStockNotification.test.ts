// バックインストック通知メールテンプレートのユニットテスト
import { describe, expect, it } from 'vitest'
import { renderBackInStockNotificationHtml } from './backInStockNotification'

describe('renderBackInStockNotificationHtml', () => {
  const baseUrl = 'https://example.com'

  it('商品名・商品URLがHTMLに含まれる', () => {
    const html = renderBackInStockNotificationHtml(
      {
        id: 'prod_123',
        name: 'テスト商品',
        images: ['https://example.com/img.jpg'],
      },
      baseUrl,
    )
    expect(html).toContain('テスト商品')
    expect(html).toContain('https://example.com/products/prod_123')
    expect(html).toContain('商品が再入荷しました')
    expect(html).toContain('https://example.com/img.jpg')
  })

  it('画像がない商品でもエラーにならない', () => {
    const html = renderBackInStockNotificationHtml(
      {
        id: 'prod_no_img',
        name: '画像なし商品',
        images: [],
      },
      baseUrl,
    )
    expect(html).toContain('画像なし商品')
    expect(html).not.toContain('<img ')
  })

  it('商品名に <script> が含まれていてもエスケープされる', () => {
    const html = renderBackInStockNotificationHtml(
      {
        id: 'prod_xss',
        name: '<script>alert(1)</script>',
        images: ['"><img src=x onerror=alert(1)>'],
      },
      baseUrl,
    )
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    // 画像URLもエスケープされる
    expect(html).not.toContain('"><img src=x onerror=alert(1)>')
  })
})
