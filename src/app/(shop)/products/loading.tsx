// 商品一覧 ローディングUI
export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 h-8 w-32 animate-pulse rounded bg-gray-200" />
      <div className="mb-6 space-y-3">
        <div className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
        <div className="flex gap-3">
          <div className="h-9 w-36 animate-pulse rounded-md bg-gray-200" />
          <div className="h-9 w-36 animate-pulse rounded-md bg-gray-200" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-gray-200">
            <div className="aspect-square w-full animate-pulse bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
