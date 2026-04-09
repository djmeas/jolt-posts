import { db } from '../../utils/db'
import { posts } from '../../db/schema'

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
  const items = hasMore ? allPosts.slice(0, limit) : allPosts

  return {
    items: items.map(post => ({
      ...post,
      photoPath: post.photoPath.replace(/^\/api\/uploads\//, '/uploads/')
    })),
    hasMore
  }
})