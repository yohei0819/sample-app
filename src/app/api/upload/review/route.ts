// 追加 (#132): レビュー画像アップロード API（ログインユーザー向け）
// POST: multipart/form-data で画像 1 ファイルを受け取り Cloudinary の review フォルダにアップロードする
import { NextResponse } from 'next/server'
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_BYTES, UPLOAD_ERROR_CODE } from '@/constants/upload'
import { auth } from '@/lib/auth'
import { uploadImageBuffer, REVIEW_IMAGE_FOLDER } from '@/lib/cloudinary'
import { logger } from '@/lib/logger'
import { enforceRateLimit } from '@/lib/rateLimit'

export const runtime = 'nodejs'

export const POST = async (req: Request) => {
  // レート制限（IP 単位）
  const limited = enforceRateLimit('REVIEW_IMAGE_UPLOAD', req)
  if (limited) return limited

  // 認証チェック（ログインユーザーのみ）
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'ログインが必要です', code: UPLOAD_ERROR_CODE.UNAUTHORIZED },
      { status: 401 },
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json(
      { error: 'multipart/form-data として読み込めませんでした', code: UPLOAD_ERROR_CODE.NO_FILE },
      { status: 400 },
    )
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'fileフィールドにファイルを指定してください', code: UPLOAD_ERROR_CODE.NO_FILE },
      { status: 400 },
    )
  }

  // MIME タイプ検証
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return NextResponse.json(
      {
        error: '対応していない画像形式です（jpeg/png/webp/gifのみ）',
        code: UPLOAD_ERROR_CODE.INVALID_TYPE,
      },
      { status: 400 },
    )
  }

  // サイズ検証
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      {
        error: `ファイルサイズが上限（${MAX_IMAGE_BYTES / 1024 / 1024}MB）を超えています`,
        code: UPLOAD_ERROR_CODE.TOO_LARGE,
      },
      { status: 400 },
    )
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const result = await uploadImageBuffer(buffer, file.name, REVIEW_IMAGE_FOLDER)
    return NextResponse.json({
      url: result.secureUrl,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
    })
  } catch (error) {
    logger.error('[upload/review] アップロード失敗', { err: error })
    return NextResponse.json(
      { error: '画像アップロードに失敗しました', code: UPLOAD_ERROR_CODE.UPLOAD_FAILED },
      { status: 500 },
    )
  }
}
