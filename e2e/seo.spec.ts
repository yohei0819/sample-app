// SEO関連エンドポイントのE2Eテスト
// sitemap.xml / robots.txt が200を返すことを確認する
// 注意: 実際にサーバが起動していないと検証できないため、E2E_BASE_URL 未設定時はスキップする。
// DBには依存しないため fixme ではなく条件付き skip を採用している。
import { test, expect } from '@playwright/test'

const shouldRun = Boolean(process.env.E2E_BASE_URL) || !process.env.CI

test.describe('SEO', () => {
  test.skip(!shouldRun, 'E2E_BASE_URL 未設定のためスキップ')

  test('robots.txt が200で返却される', async ({ request }) => {
    const res = await request.get('/robots.txt')
    expect(res.status()).toBe(200)
    const body = await res.text()
    // robots.txt の典型的な指示が含まれることを確認
    expect(body.toLowerCase()).toContain('user-agent')
  })

  test('sitemap.xml が200で返却される', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    expect(res.status()).toBe(200)
    const body = await res.text()
    // XMLのルート要素を確認
    expect(body).toContain('<urlset')
  })

  test('トップページが200で返却される', async ({ request }) => {
    const res = await request.get('/')
    expect(res.status()).toBe(200)
  })
})
