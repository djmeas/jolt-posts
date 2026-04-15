import { db } from '../../../utils/db'
import { normalizePublicUploadPath } from '../../../utils/uploadPath'
import { comments, posts, postVideos } from '../../../db/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const query = getQuery(event)
  const limit = Number(query.limit) || 20
  const offset = Number(query.offset) || 0

  const allComments = await db.select({
    id: comments.id,
    postId: comments.postId,
    authorName: comments.authorName,
    content: comments.content,
    isApproved: comments.isApproved,
    createdAt: comments.createdAt,
    postDescription: posts.description,
    postPhotoPath: posts.photoPath,
    postVideoPath: postVideos.videoPath
  })
    .from(comments)
    .leftJoin(posts, eq(comments.postId, posts.id))
    .leftJoin(postVideos, eq(comments.postId, postVideos.postId))
    .orderBy(desc(comments.createdAt))
    .limit(limit)
    .offset(offset)

  const countResult = await db.select({ count: comments.id }).from(comments)
  const total = countResult.length

  return {
    items: allComments.map(comment => ({
      ...comment,
      postPhotoPath: comment.postPhotoPath ? normalizePublicUploadPath(comment.postPhotoPath) : null,
      postVideoPath: comment.postVideoPath ? normalizePublicUploadPath(comment.postVideoPath) : null
    })),
    hasMore: offset + allComments.length < total
  }
})