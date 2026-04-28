import { describe, it, expect } from 'vitest'
import { safeJsonLd } from './jsonLd'

describe('safeJsonLd', () => {
  it('通常の文字列はそのままJSONとしてシリアライズされる（"<"は含まれない）', () => {
    const result = safeJsonLd({ name: 'SampleShop', price: 1000 })
    expect(result).toBe('{"name":"SampleShop","price":1000}')
    expect(result).not.toContain('<')
  })

  it('"</script>" を含む文字列は "<" がエスケープされHTMLパーサから離脱できない', () => {
    const result = safeJsonLd({ description: '</script><script>alert(1)</script>' })
    expect(result).not.toContain('</script>')
    expect(result).not.toContain('<')
    // '<' のみエスケープ（'>' はそのまま残るが HTML パーサ離脱には '<' があれば不可）
    expect(result).toContain('\\u003c/script>')
    // JSON として有効でありパース後の値は元のまま復元される
    expect(JSON.parse(result)).toEqual({ description: '</script><script>alert(1)</script>' })
  })

  it('"<" や ">" を含む文字列の "<" は全てエスケープされる', () => {
    const result = safeJsonLd({ html: '<div>hello</div>' })
    expect(result).not.toContain('<')
    expect(result).toContain('\\u003c')
    expect(JSON.parse(result)).toEqual({ html: '<div>hello</div>' })
  })

  it('ネストオブジェクトの中の "<" もエスケープされる', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      offers: {
        '@type': 'Offer',
        description: '<img src=x onerror=alert(1)>',
      },
    }
    const result = safeJsonLd(data)
    expect(result).not.toContain('<')
    expect(JSON.parse(result)).toEqual(data)
  })

  it('"<" を含まないネストオブジェクトは通常のJSON.stringifyと同じ結果になる', () => {
    const data = { a: { b: { c: [1, 2, 3] } } }
    expect(safeJsonLd(data)).toBe(JSON.stringify(data))
  })
})
