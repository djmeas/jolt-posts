import { db } from '../../../utils/db'
import { comments } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid comment ID' })
  }

  await db.delete(comments).where(eq(comments.id, id))

  return { success: true }
})