'use client'
// 追加 (#107): タイムセールフォーム（新規作成・編集共用）
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { saleSchema, type SaleFormValues } from '@/lib/validators/sale'

type ProductOption = { id: string; name: string; price: number }

type Props = {
  saleId?: string
  products: ProductOption[]
  defaultValues?: Partial<SaleFormValues>
}

// datetime-local 用の "YYYY-MM-DDTHH:mm" 形式に変換
const toLocalInput = (d: Date | undefined): string => {
  if (!d) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const SaleForm = ({ saleId, products, defaultValues }: Props) => {
  const router = useRouter()
  const isEdit = Boolean(saleId)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      productId: defaultValues?.productId ?? '',
      salePrice: defaultValues?.salePrice ?? 0,
      // datetime-local は string なので後で coerce される
      startsAt: defaultValues?.startsAt ?? new Date(),
      endsAt: defaultValues?.endsAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000),
      isActive: defaultValues?.isActive ?? true,
    },
  })

  const onSubmit = async (data: SaleFormValues) => {
    const url = isEdit ? `/api/admin/sales/${saleId}` : '/api/admin/sales'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const json: unknown = await res.json().catch(() => ({}))
      const message =
        json !== null &&
        typeof json === 'object' &&
        'error' in json &&
        typeof (json as Record<string, unknown>).error === 'string'
          ? ((json as Record<string, unknown>).error as string)
          : '保存に失敗しました'
      alert(message)
      return
    }
    router.push('/admin/sales')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-1">
        <label htmlFor="productId" className="block text-sm font-medium">
          商品 <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <select
          id="productId"
          {...register('productId')}
          disabled={isEdit}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted"
        >
          <option value="">商品を選択</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}（¥{p.price.toLocaleString('ja-JP')}）
            </option>
          ))}
        </select>
        {errors.productId && (
          <p role="alert" className="text-xs text-red-500">{errors.productId.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="salePrice" className="block text-sm font-medium">
          セール価格（円） <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="salePrice"
          type="number"
          min={0}
          {...register('salePrice', { valueAsNumber: true })}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.salePrice && (
          <p role="alert" className="text-xs text-red-500">{errors.salePrice.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="startsAt" className="block text-sm font-medium">
            開始日時 <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="startsAt"
            type="datetime-local"
            defaultValue={toLocalInput(defaultValues?.startsAt)}
            {...register('startsAt', { valueAsDate: true })}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.startsAt && (
            <p role="alert" className="text-xs text-red-500">{errors.startsAt.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="endsAt" className="block text-sm font-medium">
            終了日時 <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="endsAt"
            type="datetime-local"
            defaultValue={toLocalInput(defaultValues?.endsAt)}
            {...register('endsAt', { valueAsDate: true })}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.endsAt && (
            <p role="alert" className="text-xs text-red-500">{errors.endsAt.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="isActive"
          type="checkbox"
          {...register('isActive')}
          className="h-4 w-4 rounded border-gray-300 accent-primary"
        />
        <label htmlFor="isActive" className="text-sm font-medium">
          有効にする
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? '保存中…' : '保存'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/sales')}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
