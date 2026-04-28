// 管理画面 メール通知テンプレート編集ページ（Server Component）
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { findEmailTemplateByKey } from '@/lib/db/emailTemplates'
import { EmailTemplateForm } from '@/components/features/admin/EmailTemplateForm'
import {
  EMAIL_TEMPLATE_KEYS,
  EMAIL_TEMPLATE_LABELS,
  type EmailTemplateKeyValue,
} from '@/constants/email'
import { EMAIL_FALLBACK_TEMPLATES } from '@/lib/email/fallbacks' // 追加: 雛形を一元化

export const metadata = {
  title: 'メールテンプレート編集 | 管理画面',
}

// key 検証用セット
const VALID_KEYS = new Set<string>([
  EMAIL_TEMPLATE_KEYS.ORDER_CONFIRMATION,
  EMAIL_TEMPLATE_KEYS.SHIPMENT_NOTIFICATION,
  EMAIL_TEMPLATE_KEYS.BACK_IN_STOCK,
])

type Props = {
  params: Promise<{ key: string }>
}

export default async function AdminEmailTemplateEditPage({ params }: Props) {
  const { key } = await params
  if (!VALID_KEYS.has(key)) notFound()
  const typedKey = key as EmailTemplateKeyValue

  const stored = await findEmailTemplateByKey(typedKey)
  const fallback = EMAIL_FALLBACK_TEMPLATES[typedKey]
  const subject = stored?.subject ?? fallback.subject
  const bodyHtml = stored?.bodyHtml ?? fallback.bodyHtml

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/email-templates"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          一覧に戻る
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {EMAIL_TEMPLATE_LABELS[typedKey]}の編集
        </h1>
        <p className="text-sm text-muted-foreground">
          件名と本文（HTML）を編集できます。プレースホルダー（例：
          <code className="rounded bg-muted px-1">{'{{orderNumber}}'}</code>
          ）は送信時に実値へ置換されます。
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <EmailTemplateForm
          templateKey={typedKey}
          defaultSubject={subject}
          defaultBodyHtml={bodyHtml}
        />
      </div>
    </div>
  )
}
