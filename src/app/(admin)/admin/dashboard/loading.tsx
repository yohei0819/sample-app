// ダッシュボード ローディング Skeleton
export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* タイトル Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
      </div>

      {/* 統計カード Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-6 w-6 animate-pulse rounded bg-muted" />
            </div>
            <div className="mt-2 h-8 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-3 w-36 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* 注文テーブル Skeleton */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="space-y-2 p-6 pb-0">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}
