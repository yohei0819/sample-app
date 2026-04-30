'use client'

// 追加 (#131): 商品バリエーション選択コンポーネント
// 商品詳細ページで variant の属性（サイズ・カラー等）を選択し、選択中 variant を親に通知する
import { useMemo, useState } from 'react'

// バリエーション 1 件の型（attributes は Json なので unknown を経由）
export type VariantOption = {
  id: string
  sku: string
  attributes: Record<string, string>
  priceDelta: number
  stock: number
}

type Props = {
  variants: VariantOption[]
  onChange: (variant: VariantOption | null) => void
}

// attributes から「キー → 値の集合」を抽出（属性ごとのラジオボタン構築用）
const extractAttributeKeys = (variants: VariantOption[]): string[] => {
  const keys = new Set<string>()
  for (const v of variants) {
    for (const k of Object.keys(v.attributes)) {
      keys.add(k)
    }
  }
  return Array.from(keys)
}

const findMatchingVariant = (
  variants: VariantOption[],
  selected: Record<string, string>,
): VariantOption | null => {
  return (
    variants.find((v) =>
      Object.entries(selected).every(([k, val]) => v.attributes[k] === val),
    ) ?? null
  )
}

export const ProductVariantSelector = ({ variants, onChange }: Props) => {
  const attributeKeys = useMemo(() => extractAttributeKeys(variants), [variants])
  const [selected, setSelected] = useState<Record<string, string>>({})

  // 各属性キーごとに選択肢一覧（重複排除）
  const optionsByKey = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const key of attributeKeys) {
      const values = new Set<string>()
      for (const v of variants) {
        const val = v.attributes[key]
        if (typeof val === 'string') values.add(val)
      }
      map.set(key, Array.from(values))
    }
    return map
  }, [attributeKeys, variants])

  const handleSelect = (key: string, value: string) => {
    const next = { ...selected, [key]: value }
    setSelected(next)
    // 全属性が選択されていれば variant を親へ通知
    if (attributeKeys.every((k) => next[k])) {
      const matched = findMatchingVariant(variants, next)
      onChange(matched)
    } else {
      onChange(null)
    }
  }

  if (variants.length === 0) return null

  return (
    <div className="space-y-3 border-t border-gray-200 pt-4">
      {attributeKeys.map((key) => (
        <fieldset key={key} className="space-y-2">
          <legend className="text-sm font-semibold text-gray-700">{key}</legend>
          <div className="flex flex-wrap gap-2">
            {(optionsByKey.get(key) ?? []).map((value) => {
              const isSelected = selected[key] === value
              // この値を選んだときに該当 variant が在庫切れになるかチェック（簡易表示）
              const probeSelected = { ...selected, [key]: value }
              const probe = findMatchingVariant(variants, probeSelected)
              const isOutOfStock = probe !== null && probe.stock === 0
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleSelect(key, value)}
                  aria-pressed={isSelected}
                  aria-label={`${key}: ${value}${isOutOfStock ? '（在庫切れ）' : ''}`}
                  className={[
                    'min-w-[3rem] rounded-md border px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    isSelected
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white text-gray-900 hover:border-gray-500',
                    isOutOfStock ? 'opacity-40 line-through' : '',
                  ].join(' ')}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
