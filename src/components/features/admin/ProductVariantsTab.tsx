'use client'

// 追加 (#131): 管理画面 商品バリエーション CRUD タブ
// 商品編集ページに表示し、variant の追加・編集・削除を行う。
import { useEffect, useState } from 'react'
import type { ProductVariant } from '@/generated/prisma/client'
import { Button } from '@/components/ui/button'

type Props = {
  productId: string
  initialVariants: ProductVariant[]
}

// attributes を「key1: value1, key2: value2」形式の文字列に変換（表示用）
const formatAttributes = (attrs: unknown): string => {
  if (!attrs || typeof attrs !== 'object') return ''
  return Object.entries(attrs as Record<string, unknown>)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(', ')
}

// 「key1: value1, key2: value2」形式を解析（フォーム入力用）
const parseAttributesInput = (input: string): Record<string, string> | null => {
  const trimmed = input.trim()
  if (!trimmed) return null
  const result: Record<string, string> = {}
  const pairs = trimmed.split(',').map((p) => p.trim()).filter(Boolean)
  for (const pair of pairs) {
    const colon = pair.indexOf(':')
    if (colon < 0) return null
    const key = pair.slice(0, colon).trim()
    const value = pair.slice(colon + 1).trim()
    if (!key || !value) return null
    result[key] = value
  }
  return Object.keys(result).length > 0 ? result : null
}

type FormState = {
  sku: string
  attributesText: string
  priceDelta: string
  stock: string
}

const emptyForm: FormState = {
  sku: '',
  attributesText: '',
  priceDelta: '0',
  stock: '0',
}

export const ProductVariantsTab = ({ productId, initialVariants }: Props) => {
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // タブ切替時に最新を再取得
  useEffect(() => {
    setVariants(initialVariants)
  }, [initialVariants])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setError(null)
  }

  const handleEdit = (v: ProductVariant) => {
    setEditingId(v.id)
    setForm({
      sku: v.sku,
      attributesText: formatAttributes(v.attributes),
      priceDelta: String(v.priceDelta),
      stock: String(v.stock),
    })
    setError(null)
  }

  const refetch = async () => {
    const res = await fetch(`/api/admin/products/${productId}/variants`)
    if (!res.ok) return
    const json = (await res.json()) as { variants: ProductVariant[] }
    setVariants(json.variants)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const attributes = parseAttributesInput(form.attributesText)
    if (!attributes) {
      setError('属性を「キー: 値, キー: 値」形式で入力してください')
      return
    }
    const priceDelta = Number.parseInt(form.priceDelta, 10)
    const stock = Number.parseInt(form.stock, 10)
    if (Number.isNaN(priceDelta) || Number.isNaN(stock)) {
      setError('価格差分・在庫数は整数で入力してください')
      return
    }

    setSubmitting(true)
    try {
      const url = editingId
        ? `/api/admin/products/${productId}/variants/${editingId}`
        : `/api/admin/products/${productId}/variants`
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: form.sku,
          attributes,
          priceDelta,
          stock,
        }),
      })

      if (!res.ok) {
        const json: unknown = await res.json()
        const msg =
          json && typeof json === 'object' && 'error' in json && typeof (json as Record<string, unknown>).error === 'string'
            ? ((json as Record<string, unknown>).error as string)
            : '保存に失敗しました'
        setError(msg)
        return
      }

      await refetch()
      resetForm()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('このバリエーションを削除しますか？')) return
    const res = await fetch(`/api/admin/products/${productId}/variants/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const json: unknown = await res.json()
      const msg =
        json && typeof json === 'object' && 'error' in json && typeof (json as Record<string, unknown>).error === 'string'
          ? ((json as Record<string, unknown>).error as string)
          : '削除に失敗しました'
      setError(msg)
      return
    }
    await refetch()
    if (editingId === id) resetForm()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">バリエーション</h2>
        <p className="text-sm text-muted-foreground">
          サイズ・カラーなど、SKU 単位で在庫・価格差分を管理します。
        </p>
      </div>

      {/* 一覧 */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="px-3 py-2 font-medium">属性</th>
              <th className="px-3 py-2 font-medium">価格差分</th>
              <th className="px-3 py-2 font-medium">在庫</th>
              <th className="px-3 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {variants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">
                  バリエーションはまだ登録されていません
                </td>
              </tr>
            ) : (
              variants.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="px-3 py-2 font-mono">{v.sku}</td>
                  <td className="px-3 py-2">{formatAttributes(v.attributes)}</td>
                  <td className="px-3 py-2">
                    {v.priceDelta >= 0 ? '+' : ''}
                    {v.priceDelta.toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{v.stock}</td>
                  <td className="space-x-2 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(v)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(v.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* フォーム */}
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-md border p-4">
        <h3 className="font-medium">
          {editingId ? 'バリエーションを編集' : 'バリエーションを追加'}
        </h3>

        <div className="space-y-1">
          <label htmlFor="variant-sku" className="block text-sm font-medium">
            SKU <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="variant-sku"
            type="text"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            required
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="variant-attributes" className="block text-sm font-medium">
            属性（例: size: M, color: red） <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="variant-attributes"
            type="text"
            value={form.attributesText}
            onChange={(e) => setForm({ ...form, attributesText: e.target.value })}
            required
            placeholder="size: M, color: red"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground">
            「キー: 値」をカンマ区切りで入力してください
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="variant-priceDelta" className="block text-sm font-medium">
              価格差分（円）
            </label>
            <input
              id="variant-priceDelta"
              type="number"
              value={form.priceDelta}
              onChange={(e) => setForm({ ...form, priceDelta: e.target.value })}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="variant-stock" className="block text-sm font-medium">
              在庫数 <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="variant-stock"
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? '保存中...' : editingId ? '更新する' : '追加する'}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              キャンセル
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
