// 認証フローのE2Eテスト
// ログイン・ログアウト・会員登録・保護ルートのリダイレクト
// 注意: DB接続を伴うため、現状は test.fixme() でマークしている。
import { test, expect } from '@playwright/test'

test.describe('認証', () => {
  test.fixme('会員登録 → 自動ログイン → ログアウトができる', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`

    await page.goto('/register')
    await expect(page.getByRole('heading', { name: /会員登録|新規登録|登録/ })).toBeVisible()

    await page.getByLabel('お名前').fill('テストユーザー')
    await page.getByLabel('メールアドレス').fill(email)
    await page.getByLabel('パスワード').fill('Password123!')
    await page.getByRole('button', { name: /登録/ }).click()

    // 登録後はデフォルトリダイレクト先（トップ等）に遷移する想定
    await expect(page).not.toHaveURL(/\/register/)
  })

  test.fixme('既存ユーザーがログインできる', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('メールアドレス').fill('user@example.com')
    await page.getByLabel('パスワード').fill('Password123!')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(page).not.toHaveURL(/\/login/)
  })

  test.fixme('誤ったパスワードでログインに失敗するとエラーが表示される', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('メールアドレス').fill('user@example.com')
    await page.getByLabel('パスワード').fill('WrongPassword!')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(
      page.getByText('メールアドレスまたはパスワードが正しくありません'),
    ).toBeVisible()
  })

  test.fixme('未ログインで /account にアクセスすると /login にリダイレクトされる', async ({ page }) => {
    await page.goto('/account')
    await expect(page).toHaveURL(/\/login/)
  })

  test.fixme('未ログインで /orders にアクセスすると /login にリダイレクトされる', async ({ page }) => {
    await page.goto('/orders')
    await expect(page).toHaveURL(/\/login/)
  })
})
