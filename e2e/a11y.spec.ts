// 追加: アクセシビリティ自動監査 (axe-core)
// 主要ページに WCAG 2.1 AA 違反 (critical/serious) が無いことを確認する
// 注意: 動的データを必要とするページは fixme でマーク（実環境で有効化）
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PUBLIC_PAGES = [
  { path: '/', name: 'トップ' },
  { path: '/login', name: 'ログイン' },
  { path: '/register', name: '会員登録' },
  { path: '/cart', name: 'カート' },
]

test.describe('アクセシビリティ (axe-core)', () => {
  for (const { path, name } of PUBLIC_PAGES) {
    test(`${name} (${path}) に critical/serious 違反が無い`, async ({ page }) => {
      await page.goto(path)
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      const seriousViolations = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      )

      // 違反内容を分かりやすく出力
      if (seriousViolations.length > 0) {
        // eslint-disable-next-line no-console
        console.error(
          'a11y 違反:',
          JSON.stringify(
            seriousViolations.map((v) => ({ id: v.id, impact: v.impact, help: v.help })),
            null,
            2,
          ),
        )
      }

      expect(seriousViolations).toEqual([])
    })
  }

  test.fixme('商品詳細 (/products/[id]) に critical/serious 違反が無い', async ({ page }) => {
    await page.goto('/products')
    const firstCard = page.getByRole('link', { name: /の詳細を見る/ }).first()
    await firstCard.click()
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    const seriousViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    )
    expect(seriousViolations).toEqual([])
  })
})
