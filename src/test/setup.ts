// テスト環境のセットアップファイル
import '@testing-library/jest-dom'

// 追加 (#132): バリデーターが参照する Cloudinary cloud_name をテスト用に固定
// CI 環境では CLOUDINARY_CLOUD_NAME=dummy が設定されているため if ガードを外し常に上書きする。
// テスト URL のホスト名（'test'）と一致させることで review.test.ts の URL バリデーションを通過させる。
process.env.CLOUDINARY_CLOUD_NAME = 'test'
