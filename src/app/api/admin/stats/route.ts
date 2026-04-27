// 管理画面ダッシュボード統計 API
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDashboardStats, getRecentOrders } from '@/lib/db/stats'

export const GET = async () => {
  // 管理者ロールチェック
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 })
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '管理者権限が必要です', code: 'FORBIDDEN' }, { status: 403 })
  }

  try {
    const [stats, recentOrders] = await Promise.all([getDashboardStats(), getRecentOrders()])
    return NextResponse.json({ stats, recentOrders })
  } catch (err) {
    console.error('[admin/stats] 統計取得エラー:', err)
    return NextResponse.json({ error: '統計情報の取得に失敗しました', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
