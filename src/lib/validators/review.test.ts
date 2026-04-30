// 追加 (#132): レビューバリデーターのテスト
import { describe, it, expect } from 'vitest'
import { reviewInputSchema } from './review'

describe('reviewInputSchema', () => {
  it('有効な入力をパースできる', () => {
    const r = reviewInputSchema.safeParse({
      rating: 5,
      comment: 'よかった',
      images: ['https://res.cloudinary.com/test/image/upload/v1/sample-app/reviews/a.jpg'],
    })
    expect(r.success).toBe(true)
  })

  it('画像なしでもパースできる（デフォルト空配列）', () => {
    const r = reviewInputSchema.safeParse({ rating: 4 })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.images).toEqual([])
  })

  it('Cloudinary 以外の画像 URL は拒否する', () => {
    const r = reviewInputSchema.safeParse({
      rating: 3,
      images: ['https://example.com/a.jpg'],
    })
    expect(r.success).toBe(false)
  })

  it('画像が4枚以上だと拒否する', () => {
    const url = 'https://res.cloudinary.com/test/image/upload/v1/sample-app/reviews/a.jpg'
    const r = reviewInputSchema.safeParse({ rating: 3, images: [url, url, url, url] })
    expect(r.success).toBe(false)
  })

  it('rating が範囲外だと拒否する', () => {
    expect(reviewInputSchema.safeParse({ rating: 0 }).success).toBe(false)
    expect(reviewInputSchema.safeParse({ rating: 6 }).success).toBe(false)
  })

  it('コメントが1000文字超だと拒否する', () => {
    const r = reviewInputSchema.safeParse({ rating: 5, comment: 'a'.repeat(1001) })
    expect(r.success).toBe(false)
  })
})
