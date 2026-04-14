import { z } from 'zod'
import { db } from '../../utils/db'
import { posts, postPhotos, postVideos } from '../../db/schema'
import { eq } from 'drizzle-orm'

// AGENT: posts-update
const bodySchema = z.object({
  photoPath: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  photoPaths: z.array(z.string()).optional(),
  addPhotos: z.array(z.string()).optional(),
  removePhotoPaths: z.array(z.string()).optional(),
  videoPath: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid post ID' })
  }

  const body = await readBody(event)
  const parseResult = bodySchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.issues.map((e) => e.message).join(', ')
    })
  }

  if (parseResult.data.videoPath !== undefined) {
    const existingVideos = await db.query.postVideos.findMany({
      where: (videos, { eq }) => eq(videos.postId, id)
    })
    for (const video of existingVideos) {
      await db.delete(postVideos).where(eq(postVideos.id, video.id))
    }
    await db.insert(postVideos).values({ postId: id, videoPath: parseResult.data.videoPath.replace(/^\/api\/uploads\//, '/uploads/') })
    const [updated] = await db
      .update(posts)
      .set({ photoPath: parseResult.data.videoPath.replace(/^\/api\/uploads\//, '/uploads/') })
      .where(eq(posts.id, id))
      .returning()
    if (!updated) {
      throw createError({ statusCode: 404, message: 'Post not found' })
    }
    return { success: true }
  }

  const updateData: { photoPath?: string; description?: string; createdAt?: Date } = {}
  if (parseResult.data.photoPath !== undefined) {
    updateData.photoPath = parseResult.data.photoPath.replace(/^\/api\/uploads\//, '/uploads/')
  }
  if (parseResult.data.description !== undefined) updateData.description = parseResult.data.description
  if (parseResult.data.createdAt !== undefined) updateData.createdAt = new Date(parseResult.data.createdAt)

  if (parseResult.data.photoPaths !== undefined) {
    const existingVideos = await db.query.postVideos.findMany({
      where: (videos, { eq }) => eq(videos.postId, id)
    })
    for (const video of existingVideos) {
      await db.delete(postVideos).where(eq(postVideos.id, video.id))
    }

    const existingPhotos = await db.query.postPhotos.findMany({
      where: (photos, { eq }) => eq(photos.postId, id)
    })
    for (const photo of existingPhotos) {
      await db.delete(postPhotos).where(eq(postPhotos.id, photo.id))
    }
    const newPhotoEntries = parseResult.data.photoPaths.map((path, index) => ({
      postId: id,
      photoPath: path.replace(/^\/api\/uploads\//, '/uploads/'),
      orderIndex: index
    }))
    if (newPhotoEntries.length > 0) {
      await db.insert(postPhotos).values(newPhotoEntries)
    }
    if (updateData.photoPath === undefined && newPhotoEntries.length > 0) {
      updateData.photoPath = newPhotoEntries[0].photoPath
    }
  }

  if (parseResult.data.addPhotos !== undefined && parseResult.data.addPhotos.length > 0) {
    const existingVideos = await db.query.postVideos.findMany({
      where: (videos, { eq }) => eq(videos.postId, id)
    })
    if (existingVideos.length > 0) {
      throw createError({ statusCode: 400, message: 'Cannot add photos to a video post' })
    }
    const existingPhotos = await db.query.postPhotos.findMany({
      where: (photos, { eq }) => eq(photos.postId, id),
      orderBy: (photos, { desc }) => [desc(photos.orderIndex)]
    })
    const maxOrderIndex = existingPhotos.length > 0 ? existingPhotos[0].orderIndex : -1
    const newPhotoEntries = parseResult.data.addPhotos.map((path, index) => ({
      postId: id,
      photoPath: path.replace(/^\/api\/uploads\//, '/uploads/'),
      orderIndex: maxOrderIndex + 1 + index
    }))
    await db.insert(postPhotos).values(newPhotoEntries)
  }

  if (parseResult.data.removePhotoPaths !== undefined && parseResult.data.removePhotoPaths.length > 0) {
    for (const path of parseResult.data.removePhotoPaths) {
      await db.delete(postPhotos).where(eq(postPhotos.photoPath, path))
    }
  }

  if (Object.keys(updateData).length > 0) {
    const [updated] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning()

    if (!updated) {
      throw createError({ statusCode: 404, message: 'Post not found' })
    }
  }

  return { success: true }
})