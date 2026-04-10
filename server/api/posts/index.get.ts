import { db } from '../../utils/db'

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

  const photosByPostId = allPhotos.reduce((acc, photo) => {
    if (!acc[photo.postId]) acc[photo.postId] = []
    acc[photo.postId].push({ path: photo.photoPath.replace(/^\/api\/uploads\//, '/uploads/'), orderIndex: photo.orderIndex })
    return acc
  }, {} as Record<number, { path: string; orderIndex: number }[]>)

  return {
    items: pagePosts.map(post => ({
      ...post,
      photoPath: post.photoPath.replace(/^\/api\/uploads\//, '/uploads/'),
      photos: photosByPostId[post.id] || []
    })),
    hasMore
  }
})