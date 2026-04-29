// 追加 (#106): 商品の在庫変動履歴タイムライン（管理画面 Server Component）
import { findStockMovementsByProductId } from '@/lib/db/stockMovements'

const TYPE_LABEL: Record<string, string> = {
  IN: '入庫',
  OUT: '出庫',
  ADJUST: '調整',
}

const TYPE_BADGE_CLASS: Record<string, string> = {
  IN: 'bg-emerald-100 text-emerald-900',
  OUT: 'bg-red-100 text-red-900',
  ADJUST: 'bg-blue-100 text-blue-900',
}

type Props = {
  productId: string
  take?: number
}

export const StockMovementTimeline = async ({ productId, take = 20 }: Props) => {
  const movements = await findStockMovementsByProductId({ productId, take })

  return (
    <section
      aria-labelledby="stock-history-heading"
      className="rounded-lg border bg-card p-6 shadow-sm"
    >
      <h2 id="stock-history-heading" className="mb-4 text-lg font-semibold">
        在庫変動履歴
      </h2>

      {movements.length === 0 ? (
        <p className="text-sm text-muted-foreground">履歴はまだありません。</p>
      ) : (
        <ul className="divide-y">
          {movements.map((m) => (
            <li key={m.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE_CLASS[m.type]}`}
                >
                  {TYPE_LABEL[m.type]}
                </span>
                <span className={`text-sm font-medium ${m.quantity < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                  {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                </span>
                {m.reason && <span className="text-xs text-muted-foreground">{m.reason}</span>}
              </div>
              <div className="text-xs text-muted-foreground">
                {m.user?.name ?? m.user?.email ?? 'システム'}・
                {new Intl.DateTimeFormat('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(m.createdAt)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
