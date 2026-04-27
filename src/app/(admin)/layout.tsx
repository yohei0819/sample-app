// 管理画面用レイアウト
// TODO: NextAuth設定後に管理者ロールチェックを実装する
import type { ReactNode } from 'react'
import { AdminHeader } from '@/components/layouts/AdminHeader'

type Props = {
  children: ReactNode
}

export default function AdminLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
