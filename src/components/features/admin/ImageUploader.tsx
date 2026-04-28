'use client'
// 画像アップローダーコンポーネント（管理画面・商品フォーム用）
// Cloudinary に画像をアップロードしフォームの images 配列を更新する
import { useState, useRef } from 'react'
import Image from 'next/image'
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from '@/constants/upload'

type Props = {
  // 現在の画像URL一覧
  value: string[]
  // 画像URL一覧の変更通知
  onChange: (next: string[]) => void
  // 同時に保持できる最大枚数
  maxCount?: number
}

export const ImageUploader = ({ value, onChange, maxCount = 10 }: Props) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // ファイル選択時の処理
  const handleSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setError(null)

    // 上限チェック
    if (value.length + files.length > maxCount) {
      setError(`画像は最大${maxCount}枚までです`)
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setUploading(true)
    try {
      const uploaded: string[] = []
      // 直列アップロード（Cloudinary 側のレート制限を考慮）
      for (const file of Array.from(files)) {
        // クライアント側でも MIME とサイズを軽く検証
        if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
          throw new Error(`${file.name}: 対応していない画像形式です`)
        }
        if (file.size > MAX_IMAGE_BYTES) {
          throw new Error(`${file.name}: ファイルサイズが上限を超えています`)
        }

        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) {
          const json: unknown = await res.json().catch(() => null)
          const message =
            json !== null &&
            typeof json === 'object' &&
            'error' in json &&
            typeof (json as Record<string, unknown>).error === 'string'
              ? (json as Record<string, unknown>).error
              : 'アップロードに失敗しました'
          throw new Error(String(message))
        }
        const json = (await res.json()) as { url: string }
        uploaded.push(json.url)
      }
      onChange([...value, ...uploaded])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  // 画像を1枚削除
  const handleRemove = (url: string) => {
    onChange(value.filter((u) => u !== url))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label
          htmlFor="image-uploader-input"
          className="inline-flex cursor-pointer items-center rounded-md border bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          {uploading ? 'アップロード中...' : '画像を追加'}
        </label>
        <input
          ref={inputRef}
          id="image-uploader-input"
          type="file"
          accept={ALLOWED_IMAGE_MIME_TYPES.join(',')}
          multiple
          onChange={handleSelect}
          disabled={uploading || value.length >= maxCount}
          className="sr-only"
          aria-label="商品画像を選択"
        />
        <span className="text-xs text-muted-foreground">
          {value.length} / {maxCount} 枚（jpeg/png/webp/gif・最大{MAX_IMAGE_BYTES / 1024 / 1024}MB）
        </span>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}

      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((url) => (
            <li key={url} className="relative aspect-square overflow-hidden rounded-md border">
              <Image
                src={url}
                alt="商品画像"
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute right-1 top-1 rounded bg-black/60 px-2 py-1 text-xs text-white transition-opacity hover:bg-black/80"
                aria-label="この画像を削除"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
