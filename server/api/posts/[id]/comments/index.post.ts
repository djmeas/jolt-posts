import { db } from '../../../../utils/db'
import { comments, posts, settings } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const createCommentBodySchema = z.object({
  authorName: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  content: z.string().min(1, 'Comment is required').max(2000, 'Comment must be 2000 characters or less')
})

export default defineEventHandler(async (event) => {
  const postId = Number(getRouterParam(event, 'id'))

  if (isNaN(postId)) {
    throw createError({ statusCode: 400, message: 'Invalid post ID' })
  }

  const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1)

  if (!post) {
    throw createError({ statusCode: 404, message: 'Post not found' })
  }

  const commentsEnabledResult = await db.query.settings.findFirst({
    where: eq(settings.key, 'commentsEnabled')
  })

  if (commentsEnabledResult?.value !== 'true') {
    throw createError({ statusCode: 403, message: 'Comments are disabled' })
  }

  const commentsModeratedResult = await db.query.settings.findFirst({
    where: eq(settings.key, 'commentsModerated')
  })

  const isModerated = commentsModeratedResult?.value === 'true'

  const body = await readBody(event)
  const parseResult = createCommentBodySchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.issues.map((e) => e.message).join(', ')
    })
  }

  const [newComment] = await db.insert(comments).values({
    postId,
    authorName: parseResult.data.authorName,
    content: parseResult.data.content,
    isApproved: !isModerated
  }).returning()

  return newComment
})