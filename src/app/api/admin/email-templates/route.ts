// 管理画面 メール通知テンプレート一覧 API
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { findAllEmailTemplates } from '@/lib/db/emailTemplates'

// GET /api/admin/email-templates - テンプレート一覧取得
export const GET = async () => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json(
      { error: check.error, code: 'FORBIDDEN' },
      { status: check.status },
    )
  }

  try {
    const templates = await findAllEmailTemplates()
    return NextResponse.json({ templates })
  } catch (err) {
    console.error('[admin/email-templates GET] エラー:', err)
    return NextResponse.json(
      { error: 'メールテンプレートの取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
