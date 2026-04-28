// 簡易テンプレートエンジン: {{varName}} を変数値で置換する純粋関数
// itemsHtml など一部の変数は HTML を含む可能性があるため、この関数自体はエスケープを行わない。
// 呼び出し側で必要に応じて事前にエスケープした値を渡す（XSS対策の責務は呼び出し側）。

// 置換対象のプレースホルダー正規表現: {{ varName }} 形式（前後空白許容）
const PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g

// 文字列中の {{key}} を vars[key] で置換する
// vars に存在しないキーは元のまま残す（誤って空文字に置換しない）
export const applyTemplateVariables = (
  source: string,
  vars: Record<string, string | number | undefined | null>,
): string => {
  return source.replace(PLACEHOLDER_PATTERN, (match, name: string) => {
    if (!Object.prototype.hasOwnProperty.call(vars, name)) {
      return match
    }
    const value = vars[name]
    if (value === undefined || value === null) {
      return match
    }
    return String(value)
  })
}
