import { z } from 'zod'
import { db } from '../../utils/db'
import { posts, postPhotos, postVideos } from '../../db/schema'

// AGENT: posts-create
const bodySchema = z.object({
  photoPaths: z.array(z.string()).min(1, 'At least one photo is required').max(10, 'Maximum 10 photos allowed').optional(),
  videoPath: z.string().optional(),
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

  if (!parseResult.data.photoPaths && !parseResult.data.videoPath) {
    throw createError({ statusCode: 400, message: 'Either photoPaths or videoPath is required' })
  }

  if (parseResult.data.photoPaths && parseResult.data.videoPath) {
    throw createError({ statusCode: 400, message: 'A post cannot have both photos and a video' })
  }

  let post
  if (parseResult.data.videoPath) {
    [post] = await db
      .insert(posts)
      .values({ photoPath: parseResult.data.videoPath, description: parseResult.data.description })
      .returning()

    await db.insert(postVideos).values({ postId: post.id, videoPath: parseResult.data.videoPath.replace(/^\/api\/uploads\//, '/uploads/') })
  } else {
    [post] = await db
      .insert(posts)
      .values({ photoPath: parseResult.data.photoPaths![0], description: parseResult.data.description })
      .returning()

    const photoEntries = parseResult.data.photoPaths!.map((path, index) => ({
      postId: post.id,
      photoPath: path.replace(/^\/api\/uploads\//, '/uploads/'),
      orderIndex: index
    }))

    await db.insert(postPhotos).values(photoEntries)
  }

  return post
})