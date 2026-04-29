// パスワードリセットトークン関連の DB 操作（#129）
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { BCRYPT_SALT_ROUNDS } from '@/constants/auth'
import {
  PASSWORD_RESET_TOKEN_BYTES,
  PASSWORD_RESET_TOKEN_TTL_MS,
} from '@/constants/passwordReset'
import { prisma } from '@/lib/db/prisma'

// 新しいリセットトークンを発行（既存の未消費トークンは無効化）
export const issuePasswordResetToken = async (userId: string) => {
  // 既存の未消費トークンを削除（古いリンクが使えないように）
  await prisma.passwordResetToken.deleteMany({
    where: { userId, consumedAt: null },
  })

  const token = randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString('hex')
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS)
  await prisma.passwordResetToken.create({
    data: { userId, token, expiresAt },
  })
  return { token, expiresAt }
}

// トークン検証 + パスワード更新（成功時 token は consumed に）
export const consumePasswordResetToken = async (
  token: string,
  newPassword: string,
): Promise<
  { ok: true; userId: string } | { ok: false; reason: 'NOT_FOUND' | 'EXPIRED' | 'CONSUMED' }
> => {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!record) return { ok: false, reason: 'NOT_FOUND' }
  if (record.consumedAt) return { ok: false, reason: 'CONSUMED' }
  if (record.expiresAt < new Date()) {
    return { ok: false, reason: 'EXPIRED' }
  }
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS)
  // トランザクションで原子的に更新
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
    // 同ユーザーの他の未消費トークンも無効化
    prisma.passwordResetToken.deleteMany({
      where: { userId: record.userId, consumedAt: null, NOT: { id: record.id } },
    }),
  ])
  return { ok: true, userId: record.userId }
}
