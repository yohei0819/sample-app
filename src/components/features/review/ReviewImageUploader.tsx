'use client'
// 追加 (#132): レビュー画像アップローダー（最大3枚）
import Image from 'next/image'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { MAX_REVIEW_IMAGES } from '@/constants/reviews'
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from '@/constants/upload'

type Props = {
  value: string[]
  onChange: (urls: string[]) => void
  disabled?: boolean
}

export const ReviewImageUploader = ({ value, onChange, disabled }: Props) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const remaining = MAX_REVIEW_IMAGES - value.length

  const handleFiles = async (files: FileList) => {
    setError(null)
    if (files.length === 0) return
    if (files.length > remaining) {
      setError(`画像は最大${MAX_REVIEW_IMAGES}枚までです`)
      return
    }

    const allowedTypes = ALLOWED_IMAGE_MIME_TYPES as readonly string[]
    const newUrls: string[] = []
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        if (!allowedTypes.includes(file.type)) {
          setError('対応していない画像形式です（jpeg/png/webp/gifのみ）')
          return
        }
        if (file.size > MAX_IMAGE_BYTES) {
          setError(`ファイルサイズが上限（${MAX_IMAGE_BYTES / 1024 / 1024}MB）を超えています`)
          return
        }
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload/review', { method: 'POST', body: fd })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          const message =
            typeof json === 'object' && json !== null && 'error' in json
              ? String((json as { error: unknown }).error)
              : 'アップロードに失敗しました'
          setError(message)
          return
        }
        const json = (await res.json()) as { url?: string }
        if (json.url) newUrls.push(json.url)
      }
      onChange([...value, ...newUrls])
    } catch {
      setError('ネットワークエラーが発生しました')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleRemove = (url: string) => {
    onChange(value.filter((u) => u !== url))
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium leading-none">
        画像（任意・最大{MAX_REVIEW_IMAGES}枚）
      </span>

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((url) => (
            <li key={url} className="relative h-20 w-20 overflow-hidden rounded-md border">
              <Image
                src={url}
                alt="レビュー画像のプレビュー"
                fill
                sizes="80px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                disabled={disabled || uploading}
                aria-label="画像を削除"
                className="absolute right-0 top-0 rounded-bl bg-black/60 px-1 text-xs text-white hover:bg-black/80 disabled:opacity-50"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {value.length < MAX_REVIEW_IMAGES && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_IMAGE_MIME_TYPES.join(',')}
            multiple
            onChange={(e) => {
              if (e.target.files) void handleFiles(e.target.files)
            }}
            disabled={disabled || uploading}
            className="hidden"
            id="review-image-input"
            data-testid="review-image-input"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading}
          >
            {uploading ? 'アップロード中...' : '画像を追加'}
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
