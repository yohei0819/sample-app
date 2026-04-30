// テスト環境のセットアップファイル
import '@testing-library/jest-dom'

// 追加 (#132): バリデーターが参照する Cloudinary cloud_name のデフォルトをテスト用に固定
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  process.env.CLOUDINARY_CLOUD_NAME = 'test'
}
