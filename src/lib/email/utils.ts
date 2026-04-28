// メール関連の共通ユーティリティ

// HTMLエスケープ（XSS対策）
// 文字列以外を渡したい場合は呼び出し側で String(value) するルール
export const escapeHtml = (input: string): string =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
