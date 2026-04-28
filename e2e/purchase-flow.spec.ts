// 購入フローのE2Eテスト
// 商品一覧 → 商品詳細 → カート追加 → チェックアウト → 注文完了
// 注意: 実際の決済・DB接続を伴うため、現状は test.fixme() でマークしている。
// DB/Stripe テスト環境が整い次第、fixme を外して有効化する想定。
import { test, expect } from '@playwright/test'

test.describe('購入フロー', () => {
  test.fixme('商品一覧から商品詳細を経てカートに追加できる', async ({ page }) => {
    // 商品一覧を開く
    await page.goto('/products')
    await expect(page).toHaveURL(/\/products/)

    // 最初の商品カードをクリックして詳細ページへ
    const firstCard = page.getByRole('link', { name: /の詳細を見る/ }).first()
    await expect(firstCard).toBeVisible()
    await firstCard.click()

    // 詳細ページのカート追加ボタンをクリック
    await expect(page).toHaveURL(/\/products\/[^/]+/)
    await page.getByRole('button', { name: 'カートに追加する' }).click()

    // カートページに遷移して中身を確認
    await page.goto('/cart')
    await expect(page.getByRole('heading', { name: /カート/ })).toBeVisible()
  })

  test.fixme('カートからチェックアウト→配送先入力→決済まで進める', async ({ page }) => {
    // 事前にカートに商品を入れた状態を想定
    await page.goto('/cart')

    // チェックアウトへ
    await page.getByRole('link', { name: /チェックアウト|レジに進む/ }).click()
    await expect(page).toHaveURL(/\/checkout/)

    // 配送先入力
    await page.getByLabel('お名前').fill('山田太郎')
    await page.getByLabel('電話番号').fill('09012345678')
    await page.getByLabel('郵便番号').fill('1000001')
    await page.getByLabel('都道府県').fill('東京都')
    await page.getByLabel('市区町村').fill('千代田区')

    // Stripe Elements は iframe で描画されるため、実環境ではテストカード（4242...）を入力する。
    // ここではテストの形だけ示しておき、実環境構築時に有効化する。
  })

  test.fixme('在庫切れ商品ではカート追加ボタンが無効化されている', async ({ page }) => {
    await page.goto('/products')
    // 在庫切れバッジを持つ商品の詳細へ遷移する想定（実データ依存のため fixme）
    const outOfStockBadge = page.getByText('在庫切れ').first()
    await expect(outOfStockBadge).toBeVisible()
  })
})
