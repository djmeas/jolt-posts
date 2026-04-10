import { describe, it, expect } from 'vitest'
import { posts, postPhotos } from './schema'

describe('database schema', () => {
  describe('posts table', () => {
    it('has required columns', () => {
      expect(posts.id).toBeDefined()
      expect(posts.photoPath).toBeDefined()
      expect(posts.description).toBeDefined()
      expect(posts.heartCount).toBeDefined()
      expect(posts.createdAt).toBeDefined()
    })

    it('has correct defaults', () => {
      const columns = postsColumns()
      expect(columns.description.default).toBe('')
      expect(columns.heartCount.default).toBe(0)
    })
  })

  describe('postPhotos table', () => {
    it('has required columns', () => {
      expect(postPhotos.id).toBeDefined()
      expect(postPhotos.postId).toBeDefined()
      expect(postPhotos.photoPath).toBeDefined()
      expect(postPhotos.orderIndex).toBeDefined()
    })

    it('has correct defaults', () => {
      const columns = postPhotosColumns()
      expect(columns.orderIndex.default).toBe(0)
    })
  })
})

function postsColumns() {
  return {
    id: posts.id,
    photoPath: posts.photoPath,
    description: posts.description,
    heartCount: posts.heartCount,
    createdAt: posts.createdAt
  }
}

function postPhotosColumns() {
  return {
    id: postPhotos.id,
    postId: postPhotos.postId,
    photoPath: postPhotos.photoPath,
    orderIndex: postPhotos.orderIndex
  }
}
