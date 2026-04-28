// 追加: ウィッシュリストの E2E テスト
// 商品詳細から追加 → /wishlist で確認 → 削除
// 注意: DB / 認証が必要なため test.fixme() でマーク
import { test, expect } from '@playwright/test'

test.describe('ウィッシュリスト', () => {
  test.fixme('商品詳細から追加して /wishlist で確認できる', async ({ page }) => {
    await page.goto('/products')
    const firstCard = page.getByRole('link', { name: /の詳細を見る/ }).first()
    await firstCard.click()

    // ウィッシュリスト追加ボタン
    await page.getByRole('button', { name: /お気に入りに追加|ウィッシュリスト/ }).click()

    await page.goto('/wishlist')
    await expect(page.getByRole('heading', { name: /ウィッシュリスト|お気に入り/ })).toBeVisible()
    // 少なくとも1件表示
    await expect(page.getByRole('link', { name: /の詳細を見る/ }).first()).toBeVisible()
  })

  test.fixme('ウィッシュリストから商品を削除できる', async ({ page }) => {
    await page.goto('/wishlist')
    const removeBtn = page.getByRole('button', { name: /削除|外す/ }).first()
    await removeBtn.click()
    // 削除後は項目数が減るか、空の状態が表示される
    await expect(page.getByText(/まだ追加されていません|空です/)).toBeVisible()
  })

  test.fixme('未ログインで /wishlist にアクセスするとログインページへリダイレクト', async ({ page }) => {
    await page.goto('/wishlist')
    await expect(page).toHaveURL(/\/login/)
  })
})
