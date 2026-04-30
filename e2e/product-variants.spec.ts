// 追加 (#131): 商品バリエーション E2E テスト
// 注: 実際の DB / Stripe 接続が必要なため fixme でマーク。
//     DB シードで variant 入りの商品が用意され次第、fixme を外して有効化する。
import { test, expect } from '@playwright/test'

test.describe('商品バリエーション', () => {
  test.fixme(
    'バリエーションあり商品: variant を選択するとカート追加できる',
    async ({ page }) => {
      // バリエーションを持つ商品の詳細ページへ
      await page.goto('/products')
      const variantProduct = page.getByRole('link', { name: /サイズ違いの.+の詳細を見る/ }).first()
      await variantProduct.click()

      // バリエーション未選択の状態ではカート追加ボタンが disabled
      const addButton = page.getByRole('button', { name: /バリエーションを選択/ })
      await expect(addButton).toBeDisabled()

      // サイズを選択
      await page.getByRole('button', { name: /^size: M$/ }).click()
      await page.getByRole('button', { name: /^color: red$/ }).click()

      // 価格と在庫表示が更新される
      await expect(page.getByTestId('variant-display-price')).toBeVisible()
      await expect(page.getByTestId('variant-display-stock')).toBeVisible()

      // カートに追加
      await page.getByRole('button', { name: 'カートに追加する' }).click()
      await expect(page.getByRole('status')).toContainText('カートに追加しました')

      // カート画面でバリエーションラベルが表示される
      await page.goto('/cart')
      await expect(page.getByText(/size: M/)).toBeVisible()
    },
  )

  test.fixme(
    'バリエーション在庫切れの選択肢は line-through 表示になる',
    async ({ page }) => {
      await page.goto('/products')
      const variantProduct = page.getByRole('link', { name: /サイズ違いの.+の詳細を見る/ }).first()
      await variantProduct.click()

      // 在庫 0 のサイズボタンには aria-label に「在庫切れ」が含まれる
      const outOfStockButton = page.getByRole('button', { name: /在庫切れ/ })
      await expect(outOfStockButton).toBeVisible()
    },
  )

  test.fixme(
    'バリエーション選択 → チェックアウトで variantId が注文に紐付く',
    async ({ page }) => {
      // 上記テストの続きとしてチェックアウトまで進める
      await page.goto('/cart')
      await page.getByRole('link', { name: /チェックアウト|レジに進む/ }).click()
      await expect(page).toHaveURL(/\/checkout/)
      // 配送先・カード入力 → 注文確定（テスト用 PI で）
      // 詳細は purchase-flow.spec.ts と同じパターン
    },
  )
})
