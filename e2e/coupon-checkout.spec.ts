// 追加: クーポン適用フローの E2E テスト
// チェックアウト画面でコードを入力 → 割引反映 → 注文確定
// 注意: DB / Stripe / クーポンマスタが必要なため test.fixme() でマーク
import { test, expect } from '@playwright/test'

test.describe('クーポン適用', () => {
  test.fixme('有効なクーポンコードを入力すると割引が反映される', async ({ page }) => {
    // 事前にカートに商品を入れた状態を想定
    await page.goto('/checkout')

    // クーポンコード入力欄
    await page.getByLabel(/クーポンコード/).fill('SAMPLE10')
    await page.getByRole('button', { name: /適用|apply/i }).click()

    // 割引行が表示される
    await expect(page.getByText(/割引/)).toBeVisible()
  })

  test.fixme('無効なクーポンコードはエラーメッセージを表示する', async ({ page }) => {
    await page.goto('/checkout')
    await page.getByLabel(/クーポンコード/).fill('INVALID-CODE')
    await page.getByRole('button', { name: /適用|apply/i }).click()
    await expect(page.getByText(/無効|使用できません/)).toBeVisible()
  })
})
