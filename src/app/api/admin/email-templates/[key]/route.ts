// 管理画面 メール通知テンプレート 取得・更新 API（key 単位）
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import {
  findEmailTemplateByKey,
  upsertEmailTemplate,
} from '@/lib/db/emailTemplates'
import {
  emailTemplateKeySchema,
  emailTemplateUpsertSchema,
} from '@/lib/validators/emailTemplate'

type RouteContext = {
  params: Promise<{ key: string }>
}

// GET /api/admin/email-templates/[key] - 1件取得
export const GET = async (_req: NextRequest, ctx: RouteContext) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json(
      { error: check.error, code: 'FORBIDDEN' },
      { status: check.status },
    )
  }

  const { key } = await ctx.params
  const parsedKey = emailTemplateKeySchema.safeParse(key)
  if (!parsedKey.success) {
    return NextResponse.json(
      { error: '不正なテンプレートキーです', code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  try {
    const template = await findEmailTemplateByKey(parsedKey.data)
    return NextResponse.json({ template })
  } catch (err) {
    console.error('[admin/email-templates/[key] GET] エラー:', err)
    return NextResponse.json(
      { error: 'メールテンプレートの取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}

// PUT /api/admin/email-templates/[key] - upsert
export const PUT = async (req: NextRequest, ctx: RouteContext) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json(
      { error: check.error, code: 'FORBIDDEN' },
      { status: check.status },
    )
  }

  const { key } = await ctx.params
  const parsedKey = emailTemplateKeySchema.safeParse(key)
  if (!parsedKey.success) {
    return NextResponse.json(
      { error: '不正なテンプレートキーです', code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  const body: unknown = await req.json()
  const parsed = emailTemplateUpsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? 'バリデーションエラー',
        code: 'VALIDATION_ERROR',
      },
      { status: 400 },
    )
  }

  try {
    const template = await upsertEmailTemplate({
      key: parsedKey.data,
      subject: parsed.data.subject,
      bodyHtml: parsed.data.bodyHtml,
    })
    return NextResponse.json({ template })
  } catch (err) {
    console.error('[admin/email-templates/[key] PUT] エラー:', err)
    return NextResponse.json(
      { error: 'メールテンプレートの保存に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
