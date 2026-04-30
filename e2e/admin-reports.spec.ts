// 追加 (#133): 売上レポート E2E テスト
// 注: 管理者ロールでのログインと DB が必要なため test.fixme() でマーク。
//     既存の admin-management.spec.ts と同パターン。
import { test, expect } from '@playwright/test'

test.describe('管理画面 売上レポート', () => {
  test.fixme('レポートページを開いて KPI とグラフを確認できる', async ({ page }) => {
    await page.goto('/admin/reports')

    await expect(page.getByRole('heading', { name: /売上レポート/ })).toBeVisible()
    await expect(page.getByText(/期間内売上合計/)).toBeVisible()
    await expect(page.getByTestId('sales-report-chart')).toBeVisible()
  })

  test.fixme('日別から月別に切り替えると URL の granularity が更新される', async ({ page }) => {
    await page.goto('/admin/reports')

    await page.getByLabel('粒度').selectOption('month')
    await page.getByRole('button', { name: '反映' }).click()

    await expect(page).toHaveURL(/granularity=month/)
  })

  test.fixme('CSV ダウンロードリンクが現在の条件を反映する', async ({ page }) => {
    await page.goto('/admin/reports?granularity=month')

    const csvLink = page.getByTestId('sales-report-csv-link')
    await expect(csvLink).toHaveAttribute('href', /granularity=month/)
    await expect(csvLink).toHaveAttribute('href', /from=\d{4}-\d{2}-\d{2}/)
    await expect(csvLink).toHaveAttribute('href', /to=\d{4}-\d{2}-\d{2}/)
  })
})
