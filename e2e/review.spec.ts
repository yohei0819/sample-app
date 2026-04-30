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

  // 追加 (#132): 画像付きレビュー投稿 → 表示 → 別ユーザーが投票
  test.fixme('画像付きレビューを投稿し別ユーザーが「役に立った」に投票できる', async ({
    page,
    browser,
  }) => {
    // 事前にユーザー A でログイン済みであることを想定
    await page.goto('/products')
    const firstCard = page.getByRole('link', { name: /の詳細を見る/ }).first()
    await firstCard.click()

    // 星評価
    await page.getByRole('button', { name: '星5' }).click()

    // 画像アップロード（テスト用ダミー画像）
    const fileInput = page.getByTestId('review-image-input')
    await fileInput.setInputFiles('e2e/fixtures/sample.jpg')

    // コメント
    await page.getByLabel(/コメント/).fill('画像つきレビューです')
    await page.getByRole('button', { name: /投稿|送信/ }).click()

    // 投稿後にレビューと画像が表示される
    await expect(page.getByText('画像つきレビューです')).toBeVisible()
    await expect(page.getByRole('img', { name: 'レビュー画像' }).first()).toBeVisible()

    // 別ユーザー B でアクセスし投票する
    const ctxB = await browser.newContext()
    const pageB = await ctxB.newPage()
    await pageB.goto(page.url())
    const voteBtn = pageB.getByTestId('review-vote-button').first()
    const initial = await voteBtn.textContent()
    await voteBtn.click()
    await expect(voteBtn).toHaveAttribute('aria-pressed', 'true')
    // カウントが増えたこと
    await expect(voteBtn).not.toHaveText(initial ?? '')
    await ctxB.close()
  })

  // 追加 (#132): 並び替えセレクターでソート切替できる
  test.fixme('レビューを「役に立った順」で並び替えできる', async ({ page }) => {
    await page.goto('/products')
    const firstCard = page.getByRole('link', { name: /の詳細を見る/ }).first()
    await firstCard.click()
    const select = page.getByLabel('レビューの並び替え')
    await select.selectOption('helpful')
    await expect(page).toHaveURL(/reviewSort=helpful/)
  })
})
