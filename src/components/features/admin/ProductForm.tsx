'use client'
// 商品フォームコンポーネント（新規作成・編集共用）
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Category } from '@/generated/prisma/client'
import { productSchema, type ProductFormValues } from '@/lib/validators/product'

type Props = {
  // 編集時は初期値を渡す（新規作成時は undefined）
  defaultValues?: Partial<ProductFormValues>
  productId?: string
  categories: Category[]
}

export const ProductForm = ({ defaultValues, productId, categories }: Props) => {
  const router = useRouter()
  const isEdit = Boolean(productId)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: '',
      isPublished: true,
      ...defaultValues,
    },
  })

  const onSubmit = async (data: ProductFormValues) => {
    const url = isEdit ? `/api/admin/products/${productId}` : '/api/admin/products'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const json: unknown = await res.json()
      const message =
        json !== null &&
        typeof json === 'object' &&
        'error' in json &&
        typeof (json as Record<string, unknown>).error === 'string'
          ? (json as Record<string, unknown>).error
          : '保存に失敗しました'
      alert(message)
      return
    }

    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* 商品名 */}
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium">
          商品名 <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* 説明 */}
      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium">
          説明
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description')}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* 価格・在庫 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="price" className="block text-sm font-medium">
            価格（円） <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="price"
            type="number"
            min={0}
            {...register('price', { valueAsNumber: true })}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            aria-describedby={errors.price ? 'price-error' : undefined}
          />
          {errors.price && (
            <p id="price-error" className="text-xs text-red-500">{errors.price.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="stock" className="block text-sm font-medium">
            在庫数 <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="stock"
            type="number"
            min={0}
            {...register('stock', { valueAsNumber: true })}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            aria-describedby={errors.stock ? 'stock-error' : undefined}
          />
          {errors.stock && (
            <p id="stock-error" className="text-xs text-red-500">{errors.stock.message}</p>
          )}
        </div>
      </div>

      {/* カテゴリ */}
      <div className="space-y-1">
        <label htmlFor="categoryId" className="block text-sm font-medium">
          カテゴリ
        </label>
        <select
          id="categoryId"
          {...register('categoryId')}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">カテゴリなし</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* TODO: 画像アップロード（Cloudinary or Vercel Blob）は未実装 */}

      {/* 公開設定 */}
      <div className="flex items-center gap-3">
        <input
          id="isPublished"
          type="checkbox"
          {...register('isPublished')}
          className="h-4 w-4 rounded border-gray-300 accent-primary"
        />
        <label htmlFor="isPublished" className="text-sm font-medium">
          公開する
        </label>
      </div>

      {/* 送信ボタン */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? '保存中...' : isEdit ? '更新する' : '作成する'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-6 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
