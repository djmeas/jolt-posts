import { z } from 'zod'
import { db } from '../../utils/db'
import { posts } from '../../db/schema'
import { eq } from 'drizzle-orm'

// AGENT: posts-update
const bodySchema = z.object({
  photoPath: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid post ID' })
  }

  const body = await readBody(event)
  const parseResult = bodySchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.issues.map((e) => e.message).join(', ')
    })
  }

  const updateData: { photoPath?: string; description?: string; createdAt?: Date } = {}
  if (parseResult.data.photoPath !== undefined) updateData.photoPath = parseResult.data.photoPath
  if (parseResult.data.description !== undefined) updateData.description = parseResult.data.description
  if (parseResult.data.createdAt !== undefined) updateData.createdAt = new Date(parseResult.data.createdAt)
  if (updateData.photoPath) {
    updateData.photoPath = updateData.photoPath.replace(/^\/api\/uploads\//, '/uploads/')
  }

  if (Object.keys(updateData).length === 0) {
    throw createError({ statusCode: 400, message: 'No fields to update' })
  }

  const [updated] = await db
    .update(posts)
    .set(updateData)
    .where(eq(posts.id, id))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, message: 'Post not found' })
  }

  return updated
})