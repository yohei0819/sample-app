// メールアドレス確認状態を確認するユーティリティ（#120）
import 'server-only'
import { prisma } from '@/lib/db/prisma'

// userId のメールアドレス確認状態を返す
export const isEmailVerified = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerifiedAt: true },
  })
  return Boolean(user?.emailVerifiedAt)
}
