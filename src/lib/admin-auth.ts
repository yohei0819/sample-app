// 管理者ロールチェック共通処理
import { auth } from '@/lib/auth'

export const requireAdmin = async () => {
  const session = await auth()
  if (!session?.user) return { error: '認証が必要です', status: 401 }
  if (session.user.role !== 'ADMIN') return { error: '管理者権限が必要です', status: 403 }
  return { session }
}
