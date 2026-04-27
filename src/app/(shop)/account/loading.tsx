// マイページ ローディング Skeleton
export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 h-8 w-28 animate-pulse rounded bg-muted" />
      <div className="space-y-8">
        {/* プロフィール Skeleton */}
        <div className="rounded-lg border bg-card">
          <div className="border-b p-6">
            <div className="h-6 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="p-6 space-y-4">
            <div className="h-10 animate-pulse rounded bg-muted" />
            <div className="h-10 animate-pulse rounded bg-muted" />
            <div className="h-9 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
        {/* 最近の注文 Skeleton */}
        <div className="space-y-3">
          <div className="h-6 w-28 animate-pulse rounded bg-muted" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                    <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-5 w-16 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
