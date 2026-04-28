'use client'
// 管理画面 メールテンプレート編集フォーム（プレビュー付き）
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  emailTemplateUpsertSchema,
  type EmailTemplateUpsertValues,
} from '@/lib/validators/emailTemplate'
import {
  EMAIL_TEMPLATE_LABELS,
  EMAIL_TEMPLATE_VARIABLES,
  type EmailTemplateKeyValue,
} from '@/constants/email'

type Props = {
  templateKey: EmailTemplateKeyValue
  defaultSubject: string
  defaultBodyHtml: string
}

export const EmailTemplateForm = ({
  templateKey,
  defaultSubject,
  defaultBodyHtml,
}: Props) => {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EmailTemplateUpsertValues>({
    resolver: zodResolver(emailTemplateUpsertSchema),
    defaultValues: {
      subject: defaultSubject,
      bodyHtml: defaultBodyHtml,
    },
  })

  // プレビュー用に bodyHtml を購読
  const previewSubject = watch('subject')
  const previewBodyHtml = watch('bodyHtml')

  const onSubmit = async (data: EmailTemplateUpsertValues) => {
    setServerError(null)
    const res = await fetch(`/api/admin/email-templates/${templateKey}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const json: unknown = await res.json().catch(() => null)
      const message =
        json !== null &&
        typeof json === 'object' &&
        'error' in json &&
        typeof (json as Record<string, unknown>).error === 'string'
          ? (json as Record<string, string>).error
          : '保存に失敗しました'
      setServerError(message)
      return
    }
    setSavedAt(new Date())
    router.refresh()
  }

  const variables = EMAIL_TEMPLATE_VARIABLES[templateKey]

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* 編集フォーム */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">利用可能な変数</p>
          <p className="mt-1">
            本文・件名に <code className="rounded bg-muted px-1">{'{{変数名}}'}</code> 形式で記述すると送信時に置換されます。
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {variables.map((v) => (
              <li key={v}>
                <code className="rounded bg-muted px-1.5 py-0.5">{`{{${v}}}`}</code>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1">
          <label htmlFor="subject" className="text-sm font-medium">
            件名 <span className="text-destructive" aria-hidden="true">*</span>
          </label>
          <input
            id="subject"
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-describedby={errors.subject ? 'subject-error' : undefined}
            {...register('subject')}
          />
          {errors.subject && (
            <p id="subject-error" role="alert" className="text-sm text-destructive">
              {errors.subject.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="bodyHtml" className="text-sm font-medium">
            本文（HTML） <span className="text-destructive" aria-hidden="true">*</span>
          </label>
          <textarea
            id="bodyHtml"
            rows={20}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-describedby={errors.bodyHtml ? 'bodyHtml-error' : undefined}
            {...register('bodyHtml')}
          />
          {errors.bodyHtml && (
            <p id="bodyHtml-error" role="alert" className="text-sm text-destructive">
              {errors.bodyHtml.message}
            </p>
          )}
        </div>

        {serverError && (
          <p role="alert" className="text-sm text-destructive">
            {serverError}
          </p>
        )}
        {savedAt && (
          <p role="status" className="text-sm text-emerald-700">
            保存しました（{savedAt.toLocaleTimeString('ja-JP')}）
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? '保存中...' : '保存する'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/email-templates')}
            className="inline-flex items-center rounded-md border border-input px-6 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            一覧に戻る
          </button>
        </div>
      </form>

      {/* プレビュー */}
      <aside aria-label="メールプレビュー" className="space-y-3">
        <div className="text-sm font-medium">
          プレビュー（{EMAIL_TEMPLATE_LABELS[templateKey]}）
        </div>
        <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs">
          <span className="text-muted-foreground">件名:</span>{' '}
          <span className="font-medium">{previewSubject}</span>
        </div>
        <div className="overflow-auto rounded-md border bg-white p-4 max-h-[640px]">
          {/* 管理者のみアクセスする画面のため dangerouslySetInnerHTML を許容 */}
          <div dangerouslySetInnerHTML={{ __html: previewBodyHtml }} />
        </div>
        <p className="text-xs text-muted-foreground">
          ※ プレビューは入力中のHTMLをそのまま描画します。<code>{'{{変数名}}'}</code>{' '}
          は実送信時に置換されるため、ここではそのまま表示されます。
        </p>
      </aside>
    </div>
  )
}
