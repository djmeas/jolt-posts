import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { randomBytes } from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { settings } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: 'No file uploaded' })
  }

  if (formData.length > 1) {
    throw createError({ statusCode: 400, message: 'Only one avatar file allowed' })
  }

  const file = formData[0]
  if (!file.type?.startsWith('image/')) {
    throw createError({ statusCode: 400, message: 'Only image files are allowed' })
  }

  const uploadsDir = join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadsDir, { recursive: true })

  const ext = extname(file.filename || '.jpg') || '.jpg'
  const filename = `avatar${randomBytes(8).toString('hex')}${ext}`
  await writeFile(join(uploadsDir, filename), file.data)
  const avatarPath = `/uploads/${filename}`

  await db
    .insert(settings)
    .values({ key: 'avatarPath', value: avatarPath })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: avatarPath }
    })

  return { avatarPath }
})
