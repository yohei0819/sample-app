// 管理画面 メール通知テンプレート一覧ページ（Server Component）
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { findAllEmailTemplates } from '@/lib/db/emailTemplates'
import {
  EMAIL_SUBJECTS,
  EMAIL_TEMPLATE_KEYS,
  EMAIL_TEMPLATE_LABELS,
  type EmailTemplateKeyValue,
} from '@/constants/email'

export const metadata = {
  title: 'メールテンプレート管理 | 管理画面',
}

// 表示する全テンプレートキー（DB未登録分も「未カスタマイズ」として一覧表示する）
const ALL_KEYS: readonly EmailTemplateKeyValue[] = [
  EMAIL_TEMPLATE_KEYS.ORDER_CONFIRMATION,
  EMAIL_TEMPLATE_KEYS.SHIPMENT_NOTIFICATION,
  EMAIL_TEMPLATE_KEYS.BACK_IN_STOCK,
]

// フォールバックの件名（DB未登録時に表示）
const FALLBACK_SUBJECTS: Record<EmailTemplateKeyValue, string> = {
  ORDER_CONFIRMATION: EMAIL_SUBJECTS.ORDER_CONFIRMATION,
  SHIPMENT_NOTIFICATION: EMAIL_SUBJECTS.SHIPMENT_NOTIFICATION,
  BACK_IN_STOCK: EMAIL_SUBJECTS.BACK_IN_STOCK,
}

export default async function AdminEmailTemplatesPage() {
  const stored = await findAllEmailTemplates()
  // key -> 保存済みテンプレートのマップ
  const map = new Map(stored.map((t) => [t.key, t]))

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">メールテンプレート管理</h1>
        <p className="text-sm text-muted-foreground">
          注文確認・発送通知・在庫再入荷など、自動送信メールの件名と本文を編集できます。
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">テンプレート</th>
              <th className="px-4 py-3 text-left font-medium">件名</th>
              <th className="px-4 py-3 text-left font-medium">状態</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ALL_KEYS.map((key) => {
              const stored = map.get(key)
              const subject = stored?.subject ?? FALLBACK_SUBJECTS[key]
              return (
                <tr key={key}>
                  <td className="px-4 py-3 font-medium">{EMAIL_TEMPLATE_LABELS[key]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{subject}</td>
                  <td className="px-4 py-3">
                    {stored ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                        カスタム
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        既定
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/email-templates/${key}`}
                      className="inline-flex items-center gap-1 rounded-md border border-input px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
                    >
                      <Pencil size={14} aria-hidden="true" />
                      編集
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
