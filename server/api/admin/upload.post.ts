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

  if (formData.length > 10) {
    throw createError({ statusCode: 400, message: 'Maximum 10 files allowed per post' })
  }

  const uploadsDir = join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadsDir, { recursive: true })

  const photoPaths: string[] = []

  for (const file of formData) {
    if (!file.type?.startsWith('image/')) {
      throw createError({ statusCode: 400, message: 'Only image files are allowed' })
    }

    const ext = extname(file.filename || '.jpg') || '.jpg'
    const filename = `${randomBytes(16).toString('hex')}${ext}`
    await writeFile(join(uploadsDir, filename), file.data)
    photoPaths.push(`/uploads/${filename}`.replace(/^\/api\/uploads\//, '/uploads/'))
  }

  return { photoPaths }
})