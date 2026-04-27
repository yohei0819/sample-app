// 商品詳細ページ ローディングUI（スケルトン）
export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* 画像スケルトン */}
        <div className="w-full lg:w-1/2">
          <div className="aspect-square w-full rounded-xl bg-gray-200" />
        </div>

        {/* テキストスケルトン */}
        <div className="flex w-full flex-col gap-4 lg:w-1/2">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-8 w-3/4 rounded bg-gray-200" />
          <div className="h-8 w-1/3 rounded bg-gray-200" />
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-2/3 rounded bg-gray-200" />
          </div>
          <div className="mt-auto pt-4">
            <div className="h-12 w-full rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  )
}
