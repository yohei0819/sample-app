// 追加: CSV エンコードユーティリティ
// Excel / Google Sheets で文字化けせずに開けるよう UTF-8 BOM を付与する。
// 値内のダブルクォート・カンマ・改行は RFC 4180 に従いエスケープする。

const escapeCell = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  const s = typeof value === 'string' ? value : String(value)
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export const toCsv = (headers: readonly string[], rows: readonly (readonly unknown[])[]): string => {
  const lines = [headers.map(escapeCell).join(',')]
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(','))
  }
  return lines.join('\r\n')
}

// UTF-8 BOM 付き Buffer として返す（Excel 互換）
export const toCsvWithBom = (headers: readonly string[], rows: readonly (readonly unknown[])[]): Buffer => {
  const csv = toCsv(headers, rows)
  return Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(csv, 'utf-8')])
}
