'use client'
// カテゴリフォームコンポーネント（新規作成・編集共用）
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema, type CategoryFormValues } from '@/lib/validators/category'

type Props = {
  // 編集時は初期値を渡す（新規作成時は undefined）
  defaultValues?: Partial<CategoryFormValues>
  categoryId?: string
}

export const CategoryForm = ({ defaultValues, categoryId }: Props) => {
  const router = useRouter()
  const isEdit = Boolean(categoryId)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      ...defaultValues,
    },
  })

  const onSubmit = async (data: CategoryFormValues) => {
    const url = isEdit ? `/api/admin/categories/${categoryId}` : '/api/admin/categories'
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
          ? (json as Record<string, string>).error
          : 'カテゴリの保存に失敗しました'
      window.alert(message)
      return
    }

    router.push('/admin/categories')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* カテゴリ名 */}
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          カテゴリ名 <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <input
          id="name"
          type="text"
          placeholder="例：トップス"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-describedby={errors.name ? 'name-error' : undefined}
          {...register('name')}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* スラッグ */}
      <div className="space-y-1">
        <label htmlFor="slug" className="text-sm font-medium">
          スラッグ <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <input
          id="slug"
          type="text"
          placeholder="例：tops"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-describedby={errors.slug ? 'slug-error' : undefined}
          {...register('slug')}
        />
        {errors.slug && (
          <p id="slug-error" className="text-sm text-destructive">{errors.slug.message}</p>
        )}
        <p className="text-xs text-muted-foreground">半角英数字とハイフンのみ使用できます（例：mens-tops）</p>
      </div>

      {/* 送信・キャンセルボタン */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={isEdit ? 'カテゴリを更新する' : 'カテゴリを作成する'}
        >
          {isSubmitting ? '保存中…' : isEdit ? '更新する' : '作成する'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/categories')}
          className="inline-flex items-center justify-center rounded-md border border-input px-6 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
