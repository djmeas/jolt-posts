import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { sendStream } from 'h3'

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif'
}

export default defineEventHandler(async (event) => {
  const raw = getRouterParam(event, 'path') ?? ''
  const filename = Array.isArray(raw) ? raw.join('/') : String(raw)
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw createError({ statusCode: 400, message: 'Invalid path' })
  }

  const uploadsRoot = resolve(process.cwd(), 'public', 'uploads')
  const filePath = resolve(uploadsRoot, filename)
  if (!filePath.startsWith(uploadsRoot + sep)) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const st = await stat(filePath).catch(() => null)
  if (!st?.isFile()) {
    throw createError({ statusCode: 404, message: 'Not found' })
  }

  const ext = extname(filename).toLowerCase()
  const type = MIME[ext] ?? 'application/octet-stream'
  setResponseHeader(event, 'Content-Type', type)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000')

  return sendStream(event, createReadStream(filePath))
})
