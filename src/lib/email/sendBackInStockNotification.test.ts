// 再入荷通知メール送信関数のユニットテスト (#76)
import { describe, expect, it, vi, beforeEach } from 'vitest'

// Resend クライアントをモック
const sendMock = vi.fn()
vi.mock('@/lib/email/client', () => ({
  resend: { emails: { send: (...args: unknown[]) => sendMock(...args) } },
}))

// 環境変数モック
vi.mock('@/env', () => ({
  env: {
    EMAIL_FROM: 'noreply@example.com',
    NEXT_PUBLIC_APP_URL: 'https://example.com',
    RESEND_API_KEY: 're_dummy',
  },
}))

// DBテンプレートはフォールバック固定（カスタムなし）
vi.mock('@/lib/db/emailTemplates', () => ({
  getEmailTemplateOrFallback: vi.fn(async (_key: string, fallback: { subject: string; bodyHtml: string }) => ({
    ...fallback,
    isCustom: false,
  })),
}))

import { sendBackInStockNotificationEmail } from './sendBackInStockNotification'

describe('sendBackInStockNotificationEmail', () => {
  beforeEach(() => {
    sendMock.mockReset()
  })

  it('成功時に success: true を返し、Resend が正しい引数で呼ばれる', async () => {
    sendMock.mockResolvedValue({ id: 'mail_123' })
    const result = await sendBackInStockNotificationEmail({
      to: 'user@example.com',
      product: { id: 'p_1', name: 'テスト商品', images: [] },
    })
    expect(result.success).toBe(true)
    expect(sendMock).toHaveBeenCalledTimes(1)
    const arg = sendMock.mock.calls[0][0]
    expect(arg.to).toBe('user@example.com')
    expect(arg.from).toBe('noreply@example.com')
    expect(arg.subject).toBeTruthy()
    expect(arg.html).toContain('テスト商品')
  })
})
