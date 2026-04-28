// メール通知テンプレートのリポジトリ関数
import { prisma } from '@/lib/db/prisma'
import { EmailTemplateKey } from '@/generated/prisma/enums'

// 全テンプレート取得（管理画面一覧用）
export const findAllEmailTemplates = async () => {
  return prisma.emailTemplate.findMany({
    orderBy: { key: 'asc' },
  })
}

// キーで1件取得
export const findEmailTemplateByKey = async (key: EmailTemplateKey) => {
  return prisma.emailTemplate.findUnique({ where: { key } })
}

// upsert（key を一意キーとして登録 or 更新）
export const upsertEmailTemplate = async (params: {
  key: EmailTemplateKey
  subject: string
  bodyHtml: string
}) => {
  const { key, subject, bodyHtml } = params
  return prisma.emailTemplate.upsert({
    where: { key },
    create: { key, subject, bodyHtml },
    update: { subject, bodyHtml },
  })
}

// DB未登録時はfallbackを返す（送信関数からの利用）
export const getEmailTemplateOrFallback = async (
  key: EmailTemplateKey,
  fallback: { subject: string; bodyHtml: string },
): Promise<{ subject: string; bodyHtml: string; isCustom: boolean }> => {
  try {
    const template = await findEmailTemplateByKey(key)
    if (template) {
      return {
        subject: template.subject,
        bodyHtml: template.bodyHtml,
        isCustom: true,
      }
    }
  } catch (err) {
    // DB接続失敗等はフォールバックで継続させる（送信処理を止めない）
    console.error('[getEmailTemplateOrFallback] テンプレート取得失敗:', err)
  }
  return { ...fallback, isCustom: false }
}
