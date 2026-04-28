// 追加: レビュー投稿フローの E2E テスト
// 商品詳細ページから星評価とコメントを投稿し、表示を確認する
// 注意: DB / 認証セッションが必要なため test.fixme() でマーク（実環境で有効化）
import { test, expect } from '@playwright/test'

test.describe('レビュー投稿', () => {
  test.fixme('ログイン後に星評価とコメントを投稿できる', async ({ page }) => {
    // 事前にログイン済みであることを想定
    await page.goto('/products')
    const firstCard = page.getByRole('link', { name: /の詳細を見る/ }).first()
    await firstCard.click()

    // レビューフォームの星評価（5つ星）を選択
    await page.getByRole('button', { name: '星5' }).click()

    // コメント入力
    await page.getByLabel(/コメント|レビュー本文/).fill('期待以上の品質でした')

    // 投稿ボタン
    await page.getByRole('button', { name: /投稿|送信/ }).click()

    // 投稿後にレビュー一覧に表示される
    await expect(page.getByText('期待以上の品質でした')).toBeVisible()
  })

  test.fixme('未ログインの場合はレビューフォームが表示されない', async ({ page }) => {
    await page.goto('/products')
    const firstCard = page.getByRole('link', { name: /の詳細を見る/ }).first()
    await firstCard.click()
    // フォームが存在しない or ログイン誘導が表示される
    await expect(page.getByRole('button', { name: /投稿|送信/ })).toHaveCount(0)
  })
})
