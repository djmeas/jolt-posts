import { db } from '../../utils/db'
import { posts, postPhotos, postVideos } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { unlink } from 'fs/promises'
import { join } from 'path'

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

  const photos = await db.query.postPhotos.findMany({
    where: (photos, { eq }) => eq(photos.postId, id)
  })

  for (const photo of photos) {
    try {
      const filePath = join(process.cwd(), 'public', photo.photoPath)
      await unlink(filePath)
    } catch {
      // File already deleted or doesn't exist - continue
    }
  }

  const videos = await db.query.postVideos.findMany({
    where: (videos, { eq }) => eq(videos.postId, id)
  })

  for (const video of videos) {
    try {
      const filePath = join(process.cwd(), 'public', video.videoPath)
      await unlink(filePath)
    } catch {
      // File already deleted or doesn't exist - continue
    }
  }

  await db.delete(postPhotos).where(eq(postPhotos.postId, id))
  await db.delete(postVideos).where(eq(postVideos.postId, id))
  await db.delete(posts).where(eq(posts.id, id))

  return { success: true }
})