// 管理操作の監査ログ記録（#121）
import 'server-only'
import type { Prisma } from '@/generated/prisma/client'
import { AuditAction } from '@/generated/prisma/enums'
import { prisma } from '@/lib/db/prisma'

export { AuditAction }

type RecordAuditLogInput = {
  actorId: string
  action: AuditAction
  targetType: string
  targetId: string
  metadata?: Record<string, unknown>
  // トランザクション内で記録する場合に渡す
  tx?: Prisma.TransactionClient
}

// 監査ログを記録する。tx を渡すと同一トランザクション内で記録できる
export const recordAuditLog = async ({
  actorId,
  action,
  targetType,
  targetId,
  metadata,
  tx,
}: RecordAuditLogInput) => {
  const client = tx ?? prisma
  await client.auditLog.create({
    data: {
      actorId,
      action,
      targetType,
      targetId,
      metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
    },
  })
}

// 変更前後の差分を取り、変化したフィールドのみを返すヘルパー
export const buildDiff = (
  before: Record<string, unknown> | null,
  after: Record<string, unknown>,
): { before: Record<string, unknown>; after: Record<string, unknown> } => {
  const diffBefore: Record<string, unknown> = {}
  const diffAfter: Record<string, unknown> = {}
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after)])
  for (const key of keys) {
    const b = before?.[key]
    const a = after[key]
    if (JSON.stringify(b) !== JSON.stringify(a)) {
      if (b !== undefined) diffBefore[key] = b
      diffAfter[key] = a
    }
  }
  return { before: diffBefore, after: diffAfter }
}
