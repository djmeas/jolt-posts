import { z } from 'zod'
import { db } from '../../utils/db'
import { posts } from '../../db/schema'

// AGENT: posts-create
const bodySchema = z.object({
  photoPath: z.string().min(1, 'Photo path is required'),
  description: z.string().default('')
})

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const body = await readBody(event)
  const parseResult = bodySchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.issues.map((e) => e.message).join(', ')
    })
  }

  const [post] = await db
    .insert(posts)
    .values(parseResult.data)
    .returning()

  return post
})