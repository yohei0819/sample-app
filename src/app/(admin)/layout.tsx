// 管理画面用レイアウト
// 追加: NextAuth の auth() で管理者ロールチェックを実装
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { auth } from '@/lib/auth'
import { AdminHeader } from '@/components/layouts/AdminHeader'

type Props = {
  children: ReactNode
}

export default async function AdminLayout({ children }: Props) {
  // 管理者ロールチェック
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
