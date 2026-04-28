// JSON-LD を <script> タグに安全に埋め込むためのヘルパー
// JSON.stringify の結果に含まれる '<' をすべて Unicode エスケープすることで、
// </script> による HTML パーサ離脱や XSS を防ぐ。
export const safeJsonLd = (data: unknown): string =>
  JSON.stringify(data).replace(/</g, '\\u003c')
