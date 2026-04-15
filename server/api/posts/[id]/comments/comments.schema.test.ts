import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const createCommentBodySchema = z.object({
  authorName: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  content: z.string().min(1, 'Comment is required').max(2000, 'Comment must be 2000 characters or less')
})

describe('comments.schema', () => {
  describe('createCommentBodySchema', () => {
    it('accepts valid comment', () => {
      const result = createCommentBodySchema.safeParse({
        authorName: 'John Doe',
        content: 'This is a great post!'
      })
      expect(result.success).toBe(true)
    })

    it('accepts maximum length name (100 chars)', () => {
      const result = createCommentBodySchema.safeParse({
        authorName: 'A'.repeat(100),
        content: 'Valid comment'
      })
      expect(result.success).toBe(true)
    })

    it('accepts maximum length content (2000 chars)', () => {
      const result = createCommentBodySchema.safeParse({
        authorName: 'John',
        content: 'A'.repeat(2000)
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty authorName', () => {
      const result = createCommentBodySchema.safeParse({
        authorName: '',
        content: 'Valid comment'
      })
      expect(result.success).toBe(false)
    })

    it('accepts whitespace-only authorName (trimmed at API level)', () => {
      const result = createCommentBodySchema.safeParse({
        authorName: '   ',
        content: 'Valid comment'
      })
      expect(result.success).toBe(true)
    })

    it('rejects name exceeding 100 characters', () => {
      const result = createCommentBodySchema.safeParse({
        authorName: 'A'.repeat(101),
        content: 'Valid comment'
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty content', () => {
      const result = createCommentBodySchema.safeParse({
        authorName: 'John Doe',
        content: ''
      })
      expect(result.success).toBe(false)
    })

    it('accepts whitespace-only content (trimmed at API level)', () => {
      const result = createCommentBodySchema.safeParse({
        authorName: 'John Doe',
        content: '   '
      })
      expect(result.success).toBe(true)
    })

    it('rejects content exceeding 2000 characters', () => {
      const result = createCommentBodySchema.safeParse({
        authorName: 'John',
        content: 'A'.repeat(2001)
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing authorName', () => {
      const result = createCommentBodySchema.safeParse({
        content: 'Valid comment'
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing content', () => {
      const result = createCommentBodySchema.safeParse({
        authorName: 'John Doe'
      })
      expect(result.success).toBe(false)
    })
  })
})