// 管理画面の商品CRUDのE2Eテスト
// 管理者ログイン → 商品作成 → 編集 → 削除
// 注意: DB接続・管理者ユーザー存在を伴うため、現状は test.fixme() でマークしている。
import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@example.com'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'AdminPass123!'

test.describe('管理画面 商品CRUD', () => {
  test.fixme('管理者ログイン後に商品一覧を表示できる', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('メールアドレス').fill(ADMIN_EMAIL)
    await page.getByLabel('パスワード').fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: 'ログイン' }).click()

    await page.goto('/admin/products')
    await expect(page).toHaveURL(/\/admin\/products/)
    await expect(page.getByRole('heading', { name: /商品/ })).toBeVisible()
  })

  test.fixme('商品を新規作成できる', async ({ page }) => {
    // ログイン済みの状態を想定
    await page.goto('/admin/products/new')

    await page.getByLabel(/商品名/).fill('E2Eテスト商品')
    await page.getByLabel(/説明|商品説明/).fill('E2Eテスト用に作成された商品です')
    await page.getByLabel(/価格/).fill('1000')
    await page.getByLabel(/在庫/).fill('10')

    await page.getByRole('button', { name: /保存|作成|登録/ }).click()

    // 一覧に戻り、作成した商品が表示されることを確認
    await expect(page).toHaveURL(/\/admin\/products$/)
    await expect(page.getByText('E2Eテスト商品')).toBeVisible()
  })

  test.fixme('商品を編集できる', async ({ page }) => {
    await page.goto('/admin/products')

    // 一覧の編集リンクをクリック（実装により data-testid を付与する想定）
    await page.getByRole('link', { name: /編集/ }).first().click()

    await page.getByLabel(/価格/).fill('2000')
    await page.getByRole('button', { name: /保存|更新/ }).click()

    await expect(page).toHaveURL(/\/admin\/products$/)
  })

  test.fixme('商品を削除できる', async ({ page }) => {
    await page.goto('/admin/products')

    // 削除ボタンをクリック → 確認ダイアログを承諾
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: /削除/ }).first().click()

    // 削除成功のフィードバックを確認（実装に合わせて調整）
    await expect(page).toHaveURL(/\/admin\/products/)
  })

  test.fixme('一般ユーザーが /admin にアクセスすると拒否される', async ({ page }) => {
    // 一般ユーザーでログイン済みの状態を想定
    await page.goto('/admin/products')
    // 403 もしくは /login へのリダイレクトを期待
    await expect(page).not.toHaveURL(/\/admin\/products$/)
  })
})
