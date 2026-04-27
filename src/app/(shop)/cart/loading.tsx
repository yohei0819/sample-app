// カートページ ローディングUI（スケルトン）
export default function CartLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* タイトルスケルトン */}
      <div className="mb-8 h-8 w-24 animate-pulse rounded-md bg-muted" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* カートアイテムスケルトン */}
        <div className="lg:col-span-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 border-b py-4">
              <div className="h-24 w-24 flex-shrink-0 animate-pulse rounded-md bg-muted" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="h-7 w-28 animate-pulse rounded bg-muted" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                <div className="h-8 w-8 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>

        {/* サマリースケルトン */}
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    </main>
  )
}
