import { db } from '../../utils/db'
import { posts } from '../../db/schema'
import { eq } from 'drizzle-orm'

// AGENT: posts-delete
export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid post ID' })
  }

  await db.delete(posts).where(eq(posts.id, id))

  return { success: true }
})