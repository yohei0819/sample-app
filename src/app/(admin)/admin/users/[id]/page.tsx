// 管理画面 ユーザー詳細ページ（Server Component）
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { findUserById } from '@/lib/db/users'
import { USER_ROLE_LABEL, type UserRole } from '@/constants/admin'

export const metadata = {
  title: 'ユーザー詳細 | 管理画面',
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params
  const user = await findUserById(id)

  if (!user) {
    notFound()
  }

  const roleLabel = USER_ROLE_LABEL[user.role as UserRole] ?? user.role

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ユーザー詳細</h1>
          <p className="text-sm text-muted-foreground">登録ユーザーの情報を確認できます。</p>
        </div>
        <Link
          href="/admin/users"
          className="text-sm text-primary hover:underline"
        >
          ← 一覧に戻る
        </Link>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <dt className="text-xs font-medium text-muted-foreground">ID</dt>
            <dd className="mt-1 break-all text-sm font-mono">{user.id}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-xs font-medium text-muted-foreground">名前</dt>
            <dd className="mt-1 text-sm">{user.name ?? '(名前未設定)'}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-xs font-medium text-muted-foreground">メール</dt>
            <dd className="mt-1 break-all text-sm">{user.email}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-xs font-medium text-muted-foreground">ロール</dt>
            <dd className="mt-1 text-sm">{roleLabel}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-xs font-medium text-muted-foreground">状態</dt>
            <dd className="mt-1">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  user.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {user.isActive ? '有効' : '無効'}
              </span>
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-xs font-medium text-muted-foreground">注文件数</dt>
            <dd className="mt-1 text-sm">{user._count.orders} 件</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-xs font-medium text-muted-foreground">登録日</dt>
            <dd className="mt-1 text-sm">
              {new Date(user.createdAt).toLocaleString('ja-JP', {
                timeZone: 'Asia/Tokyo',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
