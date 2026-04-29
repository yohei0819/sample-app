// 監査ログ取得（#121）
import 'server-only'
import type { Prisma } from '@/generated/prisma/client'
import type { AuditAction } from '@/generated/prisma/enums'
import { prisma } from '@/lib/db/prisma'

type FindAuditLogsParams = {
  action?: AuditAction
  targetType?: string
  actorId?: string
  fromDate?: Date
  toDate?: Date
  take?: number
  skip?: number
}

export const findAuditLogs = async ({
  action,
  targetType,
  actorId,
  fromDate,
  toDate,
  take = 50,
  skip = 0,
}: FindAuditLogsParams) => {
  const where: Prisma.AuditLogWhereInput = {}
  if (action) where.action = action
  if (targetType) where.targetType = targetType
  if (actorId) where.actorId = actorId
  if (fromDate || toDate) {
    where.createdAt = {
      ...(fromDate ? { gte: fromDate } : {}),
      ...(toDate ? { lte: toDate } : {}),
    }
  }
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { actor: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.auditLog.count({ where }),
  ])
  return { logs, total }
}
