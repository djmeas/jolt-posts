import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { randomBytes } from 'crypto'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: 'No file uploaded' })
  }

  const file = formData[0]
  if (!file.type?.startsWith('image/')) {
    throw createError({ statusCode: 400, message: 'Only image files are allowed' })
  }

  const ext = extname(file.filename || '.jpg') || '.jpg'
  const filename = `${randomBytes(16).toString('hex')}${ext}`

  const uploadsDir = join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadsDir, { recursive: true })
  await writeFile(join(uploadsDir, filename), file.data)

  const photoPath = `/uploads/${filename}`.replace(/^\/api\/uploads\//, '/uploads/')
  return { photoPath }
})