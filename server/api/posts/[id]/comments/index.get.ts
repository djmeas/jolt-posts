import { db } from '../../../../utils/db'
import { comments, settings } from '../../../../db/schema'
import { eq, and, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const postId = Number(getRouterParam(event, 'id'))

  if (isNaN(postId)) {
    throw createError({ statusCode: 400, message: 'Invalid post ID' })
  }

  const commentsEnabledResult = await db.query.settings.findFirst({
    where: eq(settings.key, 'commentsEnabled')
  })

  if (commentsEnabledResult?.value !== 'true') {
    return { items: [] }
  }

  const commentsModeratedResult = await db.query.settings.findFirst({
    where: eq(settings.key, 'commentsModerated')
  })

  const isModerated = commentsModeratedResult?.value === 'true'

  const conditions = [eq(comments.postId, postId)]
  if (isModerated) {
    conditions.push(eq(comments.isApproved, true))
  }

  const postComments = await db.select().from(comments)
    .where(and(...conditions))
    .orderBy(asc(comments.createdAt))

  return {
    items: postComments
  }
})