// 発送通知メール送信関数のユニットテスト (#76)
import { describe, expect, it, vi, beforeEach } from 'vitest'

const sendMock = vi.fn()
vi.mock('@/lib/email/client', () => ({
  resend: { emails: { send: (...args: unknown[]) => sendMock(...args) } },
}))

vi.mock('@/env', () => ({
  env: {
    EMAIL_FROM: 'noreply@example.com',
    NEXT_PUBLIC_APP_URL: 'https://example.com',
    RESEND_API_KEY: 're_dummy',
  },
}))

vi.mock('@/lib/db/emailTemplates', () => ({
  getEmailTemplateOrFallback: vi.fn(async (_key: string, fallback: { subject: string; bodyHtml: string }) => ({
    ...fallback,
    isCustom: false,
  })),
}))

import { sendShipmentNotificationEmail } from './sendShipmentNotification'

const order = {
  id: 'order_1',
  shippingAddress: {
    name: '山田太郎',
    postalCode: '100-0001',
    prefecture: '東京都',
    city: '千代田区',
    addressLine1: '1-1-1',
    addressLine2: '',
    phone: '03-0000-0000',
  },
}

describe('sendShipmentNotificationEmail', () => {
  beforeEach(() => sendMock.mockReset())

  it('成功時 success: true を返し Resend が呼ばれる', async () => {
    sendMock.mockResolvedValue({ id: 'mail_1' })
    const result = await sendShipmentNotificationEmail({
      to: 'user@example.com',
      order,
      trackingNumber: 'TRACK123',
    })
    expect(result.success).toBe(true)
    expect(sendMock).toHaveBeenCalledTimes(1)
    const arg = sendMock.mock.calls[0][0]
    expect(arg.to).toBe('user@example.com')
    expect(arg.from).toBe('noreply@example.com')
  })

  it('trackingNumber 未指定でも送信できる', async () => {
    sendMock.mockResolvedValue({ id: 'mail_2' })
    const result = await sendShipmentNotificationEmail({
      to: 'user@example.com',
      order,
    })
    expect(result.success).toBe(true)
  })
})
