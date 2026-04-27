// レビュー管理ページ ローディング
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="space-y-1">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-4 w-64 rounded bg-muted animate-pulse" />
      </div>
      <div className="space-y-4">
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-muted animate-pulse" />
          ))}
        </div>
        <div className="rounded-lg border bg-card overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 px-4 py-3 border-b last:border-b-0">
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div className="h-4 w-16 rounded bg-muted animate-pulse" />
              <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
