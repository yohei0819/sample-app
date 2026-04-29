// 管理画面 ユーザー詳細・更新 API
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { AuditAction, recordAuditLog } from '@/lib/audit' // 追加 (#121)
import {
  findUserById,
  updateUserRole,
  updateUserActiveStatus,
} from '@/lib/db/users'
import { USER_ROLES } from '@/constants/admin'

type RouteParams = { params: Promise<{ id: string }> }

// PATCHボディのバリデーションスキーマ
const updateUserSchema = z
  .object({
    role: z.enum(USER_ROLES).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => v.role !== undefined || v.isActive !== undefined, {
    message: '更新項目を指定してください',
  })

// GET /api/admin/users/[id] - ユーザー詳細
export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { id } = await params

  try {
    const user = await findUserById(id)
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }
    return NextResponse.json({ user })
  } catch (err) {
    console.error('[admin/users/[id] GET] エラー:', err)
    return NextResponse.json(
      { error: 'ユーザー詳細の取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}

// PATCH /api/admin/users/[id] - ロール変更・有効化切り替え
export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error, code: 'FORBIDDEN' }, { status: check.status })
  }

  const { id } = await params

  // 自分自身のロール降格・無効化を禁止
  if (check.session.user.id === id) {
    return NextResponse.json(
      { error: '自分自身のロールや有効状態は変更できません', code: 'SELF_MODIFICATION_FORBIDDEN' },
      { status: 400 },
    )
  }

  const body: unknown = await req.json().catch(() => null)
  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'バリデーションエラー', code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  const existing = await findUserById(id)
  if (!existing) {
    return NextResponse.json(
      { error: 'ユーザーが見つかりません', code: 'NOT_FOUND' },
      { status: 404 },
    )
  }

  const { role, isActive } = parsed.data

  try {
    if (role !== undefined) {
      await updateUserRole(id, role)
      // 追加 (#121): 監査ログ記録（ロール変更）
      if (existing.role !== role) {
        await recordAuditLog({
          actorId: check.session.user.id,
          action: AuditAction.USER_ROLE_CHANGE,
          targetType: 'User',
          targetId: id,
          metadata: { from: existing.role, to: role },
        })
      }
    }
    if (isActive !== undefined) {
      await updateUserActiveStatus(id, isActive)
    }
    const user = await findUserById(id)
    return NextResponse.json({ user })
  } catch (err) {
    console.error('[admin/users/[id] PATCH] エラー:', err)
    return NextResponse.json(
      { error: 'ユーザーの更新に失敗しました', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    )
  }
}
