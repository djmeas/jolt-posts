import { db } from '../../utils/db'
import { posts, postPhotos, postVideos } from '../../db/schema'
import { createPostBodySchema, getCreatePostRuleViolation } from './posts.schema'

// AGENT: posts-create
export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const body = await readBody(event)
  const parseResult = createPostBodySchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.issues.map((e) => e.message).join(', ')
    })
  }

  const ruleViolation = getCreatePostRuleViolation(parseResult.data)
  if (ruleViolation) {
    throw createError({ statusCode: 400, message: ruleViolation })
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