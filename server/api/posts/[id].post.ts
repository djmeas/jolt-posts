import { db } from '../../utils/db'
import { posts } from '../../db/schema'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid post ID' })
  }

  await db.update(posts)
    .set({ heartCount: sql`${posts.heartCount} + 1` })
    .where(sql`${posts.id} = ${id}`)

  return { success: true }
})