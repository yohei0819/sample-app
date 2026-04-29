// メールアドレス確認トークン関連のDB操作（#120）
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/db/prisma'
import {
  EMAIL_VERIFICATION_TOKEN_BYTES,
  EMAIL_VERIFICATION_TOKEN_TTL_MS,
} from '@/constants/emailVerification'

// 新しい確認トークンを発行する（既存の未使用トークンは削除）
export const issueEmailVerificationToken = async (userId: string) => {
  // 既存トークンを全て無効化（古いリンクが使えないように）
  await prisma.emailVerificationToken.deleteMany({ where: { userId } })

  const token = randomBytes(EMAIL_VERIFICATION_TOKEN_BYTES).toString('hex')
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS)
  await prisma.emailVerificationToken.create({
    data: { userId, token, expiresAt },
  })
  return { token, expiresAt }
}

// トークン検証 → 一致＆期限内なら userId を返し、トークン削除＋emailVerifiedAt 更新
export const consumeEmailVerificationToken = async (
  token: string,
): Promise<{ ok: true; userId: string } | { ok: false; reason: 'NOT_FOUND' | 'EXPIRED' }> => {
  const record = await prisma.emailVerificationToken.findUnique({ where: { token } })
  if (!record) return { ok: false, reason: 'NOT_FOUND' }
  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { id: record.id } }).catch(() => {})
    return { ok: false, reason: 'EXPIRED' }
  }
  // トランザクションで原子的に更新
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
  ])
  return { ok: true, userId: record.userId }
}
