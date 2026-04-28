// 追加: 管理画面 注文ステータス変更・レビュー公開切り替えの E2E テスト
// 注意: 管理者ロールでのログインと DB が必要なため test.fixme() でマーク
import { test, expect } from '@playwright/test'

test.describe('管理画面 注文管理', () => {
  test.fixme('注文ステータスを SHIPPED に変更できる', async ({ page }) => {
    await page.goto('/admin/orders')
    await expect(page.getByRole('heading', { name: /注文管理/ })).toBeVisible()

    // 最初の注文の詳細へ
    const firstOrderLink = page.getByRole('link', { name: /詳細|表示/ }).first()
    await firstOrderLink.click()

    // ステータス変更
    await page.getByLabel(/ステータス/).selectOption('SHIPPED')
    await page.getByRole('button', { name: /更新|保存/ }).click()

    await expect(page.getByText(/SHIPPED|発送済み/)).toBeVisible()
  })
})

test.describe('管理画面 レビュー管理', () => {
  test.fixme('レビューの公開/非公開を切り替えられる', async ({ page }) => {
    await page.goto('/admin/reviews')
    await expect(page.getByRole('heading', { name: /レビュー管理/ })).toBeVisible()

    const toggleBtn = page.getByRole('button', { name: /公開|非公開/ }).first()
    await toggleBtn.click()

    // トースト or 状態変化を確認
    await expect(toggleBtn).toBeVisible()
  })
})
