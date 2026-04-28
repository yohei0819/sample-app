'use client'
// 管理画面 ユーザー一覧テーブル（ロール変更・有効化切替）
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { USER_ROLES, USER_ROLE_LABEL, type UserRole } from '@/constants/admin'

// 一覧表示で使うユーザーの型
type AdminUser = {
  id: string
  name: string | null
  email: string
  role: UserRole
  isActive: boolean
  createdAt: Date
}

type Props = {
  users: AdminUser[]
  currentUserId: string
}

export const UserTable = ({ users, currentUserId }: Props) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)

  // PATCHリクエスト共通処理
  const patchUser = async (id: string, body: { role?: UserRole; isActive?: boolean }) => {
    setPendingId(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null)
        const msg =
          data !== null && typeof data === 'object' && 'error' in data
            ? String((data as { error: unknown }).error)
            : '更新に失敗しました'
        window.alert(msg)
        return
      }
      startTransition(() => router.refresh())
    } finally {
      setPendingId(null)
    }
  }

  const handleRoleChange = (id: string, role: UserRole) => {
    void patchUser(id, { role })
  }

  const handleToggleActive = (id: string, currentActive: boolean) => {
    const label = currentActive ? '無効化' : '有効化'
    if (!confirm(`このユーザーを${label}しますか？`)) return
    void patchUser(id, { isActive: !currentActive })
  }

  if (users.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
        ユーザーがまだ登録されていません。
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">名前</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">メール</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">ロール</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">状態</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">登録日</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId
              const isRowPending = pendingId === user.id || isPending
              return (
                <tr
                  key={user.id}
                  className="border-b last:border-0 transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="hover:underline"
                    >
                      {user.name ?? '(名前未設定)'}
                    </Link>
                    {isSelf && (
                      <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                        自分
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      disabled={isSelf || isRowPending}
                      aria-label={`${user.email} のロールを変更`}
                      className="rounded-md border bg-background px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {USER_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {USER_ROLE_LABEL[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {user.isActive ? '有効' : '無効'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('ja-JP', {
                      timeZone: 'Asia/Tokyo',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      disabled={isSelf || isRowPending}
                      aria-label={`${user.email} を${user.isActive ? '無効化' : '有効化'}`}
                      className={`inline-flex items-center gap-1 rounded-md border px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        user.isActive
                          ? 'border-orange-300 text-orange-600 hover:bg-orange-50'
                          : 'border-green-300 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {user.isActive ? '無効化' : '有効化'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
