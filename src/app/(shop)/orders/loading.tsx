// 注文履歴 ローディング Skeleton
export default function OrdersLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 h-8 w-32 animate-pulse rounded bg-muted" />
      <ul className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="rounded-lg border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                  <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-5 w-16 animate-pulse rounded bg-muted" />
            </div>
            <div className="mt-4 flex gap-2">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="h-4 w-24 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
