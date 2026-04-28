// 画像アップロード API（管理者専用）
// POST: multipart/form-data で画像 1 ファイルを受け取り Cloudinary にアップロードする
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { uploadImageBuffer } from '@/lib/cloudinary'
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  UPLOAD_ERROR_CODE,
} from '@/constants/upload'
import { enforceRateLimit } from '@/lib/rateLimit'

export const runtime = 'nodejs'

export const POST = async (req: Request) => {
  // 追加: レート制限
  const limited = enforceRateLimit('ADMIN_UPLOAD', req)
  if (limited) return limited

  // 管理者チェック
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json(
      { error: check.error, code: UPLOAD_ERROR_CODE.UNAUTHORIZED },
      { status: check.status },
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
    const result = await uploadImageBuffer(buffer, file.name)
    return NextResponse.json({
      url: result.secureUrl,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
    })
  } catch (error) {
    console.error('画像アップロードに失敗しました', error)
    return NextResponse.json(
      { error: '画像アップロードに失敗しました', code: UPLOAD_ERROR_CODE.UPLOAD_FAILED },
      { status: 500 },
    )
  }
}
