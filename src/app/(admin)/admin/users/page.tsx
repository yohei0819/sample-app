// 管理画面 ユーザー一覧ページ（Server Component）
import { redirect } from 'next/navigation'
import { UserTable } from '@/components/features/admin/UserTable'
import { findAllUsers } from '@/lib/db/users'
import { auth } from '@/lib/auth'
import type { UserRole } from '@/constants/admin'

export const metadata = {
  title: 'ユーザー管理 | 管理画面',
}

export default async function AdminUsersPage() {
  const session = await auth()
  // レイアウトでもチェック済みだが、ID取得のため再取得
  if (!session?.user) {
    redirect('/login')
  }

  const users = await findAllUsers()

  // role を UserRole 型へ絞り込む
  const typedUsers = users.map((u) => ({
    ...u,
    role: u.role as UserRole,
  }))

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ユーザー管理</h1>
        <p className="text-sm text-muted-foreground">
          登録ユーザーのロール変更と有効/無効の切り替えができます。
        </p>
      </div>

      <UserTable users={typedUsers} currentUserId={session.user.id} />
    </div>
  )
}
