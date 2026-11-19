import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

const region = process.env.S3_REGION || 'us-east-1'
const bucket = process.env.S3_BUCKET || ''
const prefix = (process.env.S3_PREFIX || 'tours').replace(/^\/+|\/+$/g, '')

const s3 = new S3Client({ region })

export type UploadInput = {
  buffer: Buffer
  originalname: string
  mimetype: string
  size: number
}

export type StoredFile = {
  name: string
  type: string
  size: number
  url: string
  key: string
}

function sanitize(name: string): string {
  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return clean || 'file'
}

export const storageService = {
  async upload(file: UploadInput): Promise<StoredFile> {
    if (!bucket) throw new Error('S3_BUCKET is not configured')
    const key = prefix
      ? `${prefix}/${uuidv4()}-${sanitize(file.originalname)}`
      : `${uuidv4()}-${sanitize(file.originalname)}`
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    )
    return {
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      url: `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
      key,
    }
  },
}
