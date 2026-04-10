import { z } from 'zod'
import { db } from '../../utils/db'
import { posts, postPhotos } from '../../db/schema'

// AGENT: posts-create
const bodySchema = z.object({
  photoPaths: z.array(z.string()).min(1, 'At least one photo is required').max(10, 'Maximum 10 photos allowed'),
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
    .values({ photoPath: parseResult.data.photoPaths[0], description: parseResult.data.description })
    .returning()

  const photoEntries = parseResult.data.photoPaths.map((path, index) => ({
    postId: post.id,
    photoPath: path.replace(/^\/api\/uploads\//, '/uploads/'),
    orderIndex: index
  }))

  await db.insert(postPhotos).values(photoEntries)

  return post
})