'use client'

// 配送先アドレス帳マネージャ（#134）
// 一覧表示 + 追加 / 編集 / 削除 / デフォルト切替
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addressInputSchema, type AddressInput } from '@/lib/validators/address'

export type AddressItem = {
  id: string
  name: string
  postalCode: string
  prefecture: string
  city: string
  addressLine1: string
  addressLine2: string
  phone: string
  isDefault: boolean
}

type Props = {
  initialAddresses: AddressItem[]
}

export const AddressBookManager = ({ initialAddresses }: Props) => {
  const router = useRouter()
  const [addresses, setAddresses] = useState<AddressItem[]>(initialAddresses)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const editing = editingId ? addresses.find((a) => a.id === editingId) ?? null : null

  const form = useForm<AddressInput>({
    resolver: zodResolver(addressInputSchema),
    defaultValues: {
      name: '',
      postalCode: '',
      prefecture: '',
      city: '',
      addressLine1: '',
      addressLine2: '',
      phone: '',
      isDefault: false,
    },
  })

  const startCreate = () => {
    setEditingId(null)
    form.reset({
      name: '',
      postalCode: '',
      prefecture: '',
      city: '',
      addressLine1: '',
      addressLine2: '',
      phone: '',
      isDefault: addresses.length === 0,
    })
    setServerError(null)
    setShowForm(true)
  }

  const startEdit = (a: AddressItem) => {
    setEditingId(a.id)
    form.reset({
      name: a.name,
      postalCode: a.postalCode,
      prefecture: a.prefecture,
      city: a.city,
      addressLine1: a.addressLine1,
      addressLine2: a.addressLine2,
      phone: a.phone,
      isDefault: a.isDefault,
    })
    setServerError(null)
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setServerError(null)
  }

  const onSubmit = async (data: AddressInput) => {
    setServerError(null)
    try {
      const url = editingId
        ? `/api/account/addresses/${editingId}`
        : '/api/account/addresses'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string }
        setServerError(json.error ?? '保存に失敗しました')
        return
      }
      setShowForm(false)
      setEditingId(null)
      router.refresh()
      // ローカル状態の即時更新（サーバ情報で最終的に refresh される）
      const json = (await res.json()) as { address: { id: string } & AddressInput }
      const updated: AddressItem = {
        id: json.address.id,
        name: json.address.name,
        postalCode: json.address.postalCode,
        prefecture: json.address.prefecture,
        city: json.address.city,
        addressLine1: json.address.addressLine1,
        addressLine2: json.address.addressLine2 ?? '',
        phone: json.address.phone,
        isDefault: Boolean(json.address.isDefault),
      }
      setAddresses((prev) => {
        const next = editingId
          ? prev.map((a) => (a.id === editingId ? updated : a))
          : [...prev, updated]
        if (updated.isDefault) {
          return next.map((a) =>
            a.id === updated.id ? a : { ...a, isDefault: false },
          )
        }
        return next
      })
    } catch {
      setServerError('通信エラーが発生しました')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このアドレスを削除しますか？')) return
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string }
        setServerError(json.error ?? '削除に失敗しました')
        return
      }
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      router.refresh()
    } catch {
      setServerError('通信エラーが発生しました')
    }
  }

  return (
    <div className="space-y-4">
      {/* 一覧 */}
      {addresses.length === 0 && !showForm ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            登録されたアドレスはありません。
          </p>
          <Button type="button" onClick={startCreate}>
            アドレスを追加
          </Button>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {addresses.map((a) => (
              <li key={a.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{a.name}</span>
                      {a.isDefault && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                          デフォルト
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      〒{a.postalCode} {a.prefecture}
                      {a.city}
                    </p>
                    <p className="text-muted-foreground">{a.addressLine1}</p>
                    {a.addressLine2 && (
                      <p className="text-muted-foreground">{a.addressLine2}</p>
                    )}
                    <p className="text-muted-foreground">TEL: {a.phone}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(a)}
                    >
                      編集
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(a.id)}
                    >
                      削除
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {!showForm && (
            <Button type="button" onClick={startCreate}>
              アドレスを追加
            </Button>
          )}
        </>
      )}

      {/* フォーム */}
      {showForm && (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="rounded-lg border bg-card p-6 space-y-4"
        >
          <h2 className="font-semibold">
            {editing ? 'アドレスを編集' : 'アドレスを追加'}
          </h2>

          <div className="space-y-2">
            <Label htmlFor="name">お名前</Label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive" role="alert">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="postalCode">郵便番号</Label>
              <Input
                id="postalCode"
                {...form.register('postalCode')}
                autoComplete="postal-code"
              />
              {form.formState.errors.postalCode && (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.postalCode.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="prefecture">都道府県</Label>
              <Input id="prefecture" {...form.register('prefecture')} />
              {form.formState.errors.prefecture && (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.prefecture.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">市区町村</Label>
            <Input id="city" {...form.register('city')} />
            {form.formState.errors.city && (
              <p className="text-sm text-destructive" role="alert">
                {form.formState.errors.city.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine1">番地</Label>
            <Input id="addressLine1" {...form.register('addressLine1')} />
            {form.formState.errors.addressLine1 && (
              <p className="text-sm text-destructive" role="alert">
                {form.formState.errors.addressLine1.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">建物名・部屋番号（任意）</Label>
            <Input id="addressLine2" {...form.register('addressLine2')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">電話番号</Label>
            <Input id="phone" type="tel" {...form.register('phone')} />
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive" role="alert">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              {...form.register('isDefault')}
              className="h-4 w-4 rounded border-border"
            />
            デフォルトの配送先にする
          </label>

          {serverError && (
            <p className="text-sm text-destructive" role="alert">
              {serverError}
            </p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? '保存中...' : '保存'}
            </Button>
            <Button type="button" variant="ghost" onClick={cancelForm}>
              キャンセル
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
