// 管理画面 監査ログ一覧ページ（#121）
import { redirect } from 'next/navigation'
import { AUDIT_ACTIONS, type AuditActionLabel } from '@/constants/audit'
import { auth } from '@/lib/auth'
import type { AuditAction } from '@/generated/prisma/enums'
import { findAuditLogs } from '@/lib/db/auditLogs'

export const metadata = {
  title: '監査ログ | 管理画面',
}

type SearchParams = Promise<{
  action?: string
  targetType?: string
  from?: string
  to?: string
  page?: string
}>

const PAGE_SIZE = 50

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const sp = await searchParams
  const page = Math.max(1, Number(sp.page ?? '1'))
  const action =
    sp.action && (AUDIT_ACTIONS as readonly string[]).includes(sp.action)
      ? (sp.action as AuditAction)
      : undefined
  const fromDate = sp.from ? new Date(sp.from) : undefined
  const toDate = sp.to ? new Date(sp.to) : undefined

  const { logs, total } = await findAuditLogs({
    action,
    targetType: sp.targetType || undefined,
    fromDate: fromDate && !Number.isNaN(fromDate.getTime()) ? fromDate : undefined,
    toDate: toDate && !Number.isNaN(toDate.getTime()) ? toDate : undefined,
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  })

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">監査ログ</h1>
        <p className="text-sm text-muted-foreground">
          管理画面で実行された操作の履歴を確認できます。
        </p>
      </div>

      <form className="flex flex-wrap gap-3 rounded border p-4" method="get">
        <label className="flex flex-col text-sm">
          <span className="mb-1 text-muted-foreground">アクション</span>
          <select
            name="action"
            defaultValue={sp.action ?? ''}
            className="rounded border px-2 py-1"
          >
            <option value="">すべて</option>
            {AUDIT_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {AUDIT_ACTION_LABELS[a]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm">
          <span className="mb-1 text-muted-foreground">対象タイプ</span>
          <input
            type="text"
            name="targetType"
            defaultValue={sp.targetType ?? ''}
            placeholder="Product / Order / ..."
            className="rounded border px-2 py-1"
          />
        </label>
        <label className="flex flex-col text-sm">
          <span className="mb-1 text-muted-foreground">開始日</span>
          <input
            type="date"
            name="from"
            defaultValue={sp.from ?? ''}
            className="rounded border px-2 py-1"
          />
        </label>
        <label className="flex flex-col text-sm">
          <span className="mb-1 text-muted-foreground">終了日</span>
          <input
            type="date"
            name="to"
            defaultValue={sp.to ?? ''}
            className="rounded border px-2 py-1"
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="rounded bg-primary px-4 py-1 text-sm text-primary-foreground hover:opacity-90"
          >
            絞り込む
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left">日時</th>
              <th className="px-3 py-2 text-left">操作者</th>
              <th className="px-3 py-2 text-left">アクション</th>
              <th className="px-3 py-2 text-left">対象</th>
              <th className="px-3 py-2 text-left">詳細</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  該当する監査ログはありません
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="whitespace-nowrap px-3 py-2">
                    {new Date(log.createdAt).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-3 py-2">
                    {log.actor?.name ?? log.actor?.email ?? log.actorId}
                  </td>
                  <td className="px-3 py-2">{AUDIT_ACTION_LABELS[log.action]}</td>
                  <td className="px-3 py-2">
                    {log.targetType}: {log.targetId}
                  </td>
                  <td className="px-3 py-2">
                    <pre className="max-w-xs overflow-x-auto text-xs">
                      {log.metadata ? JSON.stringify(log.metadata, null, 2) : '-'}
                    </pre>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span>
          {total} 件中 {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} 件
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <a
              className="rounded border px-3 py-1 hover:bg-muted"
              href={`?${new URLSearchParams({ ...stripPage(sp), page: String(page - 1) }).toString()}`}
            >
              前へ
            </a>
          )}
          {page < totalPages && (
            <a
              className="rounded border px-3 py-1 hover:bg-muted"
              href={`?${new URLSearchParams({ ...stripPage(sp), page: String(page + 1) }).toString()}`}
            >
              次へ
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

const AUDIT_ACTION_LABELS: Record<AuditActionLabel, string> = {
  PRODUCT_CREATE: '商品作成',
  PRODUCT_UPDATE: '商品更新',
  PRODUCT_DELETE: '商品削除',
  STOCK_ADJUST: '在庫調整',
  SALE_CREATE: 'セール作成',
  SALE_UPDATE: 'セール更新',
  SALE_DELETE: 'セール削除',
  ORDER_STATUS_CHANGE: '注文ステータス変更',
  USER_ROLE_CHANGE: 'ユーザーロール変更',
}

const stripPage = (sp: Record<string, string | undefined>): Record<string, string> => {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(sp)) {
    if (k === 'page') continue
    if (v) out[k] = v
  }
  return out
}
