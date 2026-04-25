import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// 追加: グローバル型宣言（開発時のホットリロードによる多重インスタンス防止）
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = (): PrismaClient => {
  // TODO: 将来的に src/env.ts（Zod）で DATABASE_URL を検証・型付けする予定
  // 現時点では undefined の場合に実行時クラッシュを防ぐため非 null アサーションを使用する
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


