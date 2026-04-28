// 管理画面 メール通知テンプレート編集ページ（Server Component）
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { findEmailTemplateByKey } from '@/lib/db/emailTemplates'
import { EmailTemplateForm } from '@/components/features/admin/EmailTemplateForm'
import {
  EMAIL_SUBJECTS,
  EMAIL_TEMPLATE_KEYS,
  EMAIL_TEMPLATE_LABELS,
  type EmailTemplateKeyValue,
} from '@/constants/email'

export const metadata = {
  title: 'メールテンプレート編集 | 管理画面',
}

// key 検証用セット
const VALID_KEYS = new Set<string>([
  EMAIL_TEMPLATE_KEYS.ORDER_CONFIRMATION,
  EMAIL_TEMPLATE_KEYS.SHIPMENT_NOTIFICATION,
  EMAIL_TEMPLATE_KEYS.BACK_IN_STOCK,
])

// フォールバックのデフォルト本文（DB未登録時の編集起点として提示する雛形）
const FALLBACK_BODIES: Record<EmailTemplateKeyValue, { subject: string; bodyHtml: string }> = {
  ORDER_CONFIRMATION: {
    subject: EMAIL_SUBJECTS.ORDER_CONFIRMATION,
    bodyHtml: `<p>{{customerName}} 様</p>
<p>この度はご注文いただきありがとうございます。以下の内容で承りました。</p>
<p><strong>注文番号:</strong> {{orderNumber}}<br/>
<strong>合計金額:</strong> {{totalAmount}}</p>
<h2>ご注文内容</h2>
{{itemsHtml}}
<p>商品の発送までしばらくお待ちください。</p>`,
  },
  SHIPMENT_NOTIFICATION: {
    subject: EMAIL_SUBJECTS.SHIPMENT_NOTIFICATION,
    bodyHtml: `<p>{{customerName}} 様</p>
<p>ご注文の商品を発送しました。</p>
<p><strong>注文番号:</strong> {{orderNumber}}<br/>
<strong>追跡番号:</strong> {{trackingNumber}}</p>
<p>到着まで今しばらくお待ちください。</p>`,
  },
  BACK_IN_STOCK: {
    subject: EMAIL_SUBJECTS.BACK_IN_STOCK,
    bodyHtml: `<p>お待たせしました。ご希望の商品が再入荷しました。</p>
<p><strong>{{productName}}</strong></p>
<p><a href="{{productUrl}}">商品ページを見る</a></p>
<p>在庫には限りがありますのでお早めにご検討ください。</p>`,
  },
}

type Props = {
  params: Promise<{ key: string }>
}

export default async function AdminEmailTemplateEditPage({ params }: Props) {
  const { key } = await params
  if (!VALID_KEYS.has(key)) notFound()
  const typedKey = key as EmailTemplateKeyValue

  const stored = await findEmailTemplateByKey(typedKey)
  const fallback = FALLBACK_BODIES[typedKey]
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
