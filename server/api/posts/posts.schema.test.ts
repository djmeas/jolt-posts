import { describe, it, expect } from 'vitest'
import {
  createPostBodySchema,
  getCreatePostRuleViolation,
  updatePostBodySchema
} from './posts.schema'

describe('posts.schema', () => {
  describe('createPostBodySchema', () => {
    it('accepts multi-photo body', () => {
      const result = createPostBodySchema.safeParse({
        photoPaths: ['/api/uploads/a.jpg', '/api/uploads/b.jpg'],
        description: 'Hello'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBe('Hello')
        expect(getCreatePostRuleViolation(result.data)).toBeNull()
      }
    })

    it('accepts video-only body', () => {
      const result = createPostBodySchema.safeParse({
        videoPath: '/api/uploads/clip.mp4',
        description: ''
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(getCreatePostRuleViolation(result.data)).toBeNull()
      }
    })

    it('defaults description to empty string', () => {
      const result = createPostBodySchema.safeParse({ photoPaths: ['/api/uploads/x.jpg'] })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBe('')
      }
    })

    it('rejects empty photoPaths when field is present', () => {
      const result = createPostBodySchema.safeParse({ photoPaths: [] })
      expect(result.success).toBe(false)
    })

    it('rejects more than 10 photos', () => {
      const result = createPostBodySchema.safeParse({
        photoPaths: Array(11).fill('/api/uploads/x.jpg')
      })
      expect(result.success).toBe(false)
    })

    it('parses body with neither photos nor video (rule enforced separately)', () => {
      const result = createPostBodySchema.safeParse({ description: 'x' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(getCreatePostRuleViolation(result.data)).toBe(
          'Either photoPaths or videoPath is required'
        )
      }
    })

    it('rejects both photoPaths and videoPath via rule helper', () => {
      const result = createPostBodySchema.safeParse({
        photoPaths: ['/api/uploads/a.jpg'],
        videoPath: '/api/uploads/v.mp4'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(getCreatePostRuleViolation(result.data)).toBe(
          'A post cannot have both photos and a video'
        )
      }
    })
  })

  describe('updatePostBodySchema', () => {
    it('accepts empty object', () => {
      const result = updatePostBodySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('accepts videoPath only', () => {
      const result = updatePostBodySchema.safeParse({
        videoPath: '/uploads/reel.mp4'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.videoPath).toBe('/uploads/reel.mp4')
      }
    })

    it('accepts photoPaths replacement', () => {
      const result = updatePostBodySchema.safeParse({
        photoPaths: ['/uploads/1.jpg', '/uploads/2.jpg']
      })
      expect(result.success).toBe(true)
    })

    it('accepts addPhotos and removePhotoPaths', () => {
      const result = updatePostBodySchema.safeParse({
        addPhotos: ['/uploads/new.jpg'],
        removePhotoPaths: ['/uploads/old.jpg']
      })
      expect(result.success).toBe(true)
    })
  })
})
