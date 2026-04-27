// 最新注文一覧テーブルコンポーネント
import type { RecentOrder } from '@/lib/db/stats'
// 変更: マジック文字列を constants に切り出し
import { ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from '@/constants/admin'

type Props = {
  orders: RecentOrder[]
}

export const RecentOrders = ({ orders }: Props) => {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">最新の注文</h2>
        <p className="text-sm text-muted-foreground">注文がまだありません。</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="p-6 pb-0">
        <h2 className="text-lg font-semibold">最新の注文</h2>
        <p className="text-sm text-muted-foreground">直近10件の注文</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">注文ID</th>
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">顧客</th>
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">金額</th>
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">ステータス</th>
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">日時</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                  {order.id.slice(0, 8)}…
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium">{order.user.name ?? '（名前未設定）'}</p>
                  <p className="text-xs text-muted-foreground">{order.user.email}</p>
                </td>
                <td className="px-6 py-4 font-medium">
                  ¥{order.totalPrice.toLocaleString('ja-JP')}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_CLASS[order.status] ?? 'bg-gray-100 text-gray-800'}`}
                  >
                    {ORDER_STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
