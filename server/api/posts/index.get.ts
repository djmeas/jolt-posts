import { db } from '../../utils/db'
import { normalizePublicUploadPath } from '../../utils/uploadPath'

// AGENT: posts-list
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Number(query.limit) || 10
  const offset = Number(query.offset) || 0

  const allPosts = await db.query.posts.findMany({
    orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    limit: limit + 1,
    offset
  })

  const hasMore = allPosts.length > limit
  const pagePosts = hasMore ? allPosts.slice(0, limit) : allPosts

  const postIds = pagePosts.map(p => p.id)
  const allPhotos = await db.query.postPhotos.findMany({
    where: (photos, { inArray }) => inArray(photos.postId, postIds),
    orderBy: (photos, { asc }) => [asc(photos.orderIndex)]
  })

  const allVideos = await db.query.postVideos.findMany({
    where: (videos, { inArray }) => inArray(videos.postId, postIds)
  })

  const photosByPostId = allPhotos.reduce((acc, photo) => {
    if (!acc[photo.postId]) acc[photo.postId] = []
    acc[photo.postId].push({ path: normalizePublicUploadPath(photo.photoPath), orderIndex: photo.orderIndex })
    return acc
  }, {} as Record<number, { path: string; orderIndex: number }[]>)

  const videoByPostId = allVideos.reduce((acc, video) => {
    if (!acc[video.postId]) acc[video.postId] = { path: normalizePublicUploadPath(video.videoPath) }
    return acc
  }, {} as Record<number, { path: string }>)

  return {
    items: pagePosts.map(post => ({
      ...post,
      photoPath: normalizePublicUploadPath(post.photoPath),
      photos: photosByPostId[post.id] || [],
      videoPath: videoByPostId[post.id] || null
    })),
    hasMore
  }
})