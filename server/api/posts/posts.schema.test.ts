import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const bodySchema = z.object({
  photoPaths: z.array(z.string()).min(1, 'At least one photo is required').max(10, 'Maximum 10 photos allowed'),
  description: z.string().default('')
})

describe('posts API schema', () => {
  describe('bodySchema', () => {
    it('validates valid post creation body', () => {
      const validBody = {
        photoPaths: ['/api/uploads/test.jpg'],
        description: 'Test post'
      }
      const result = bodySchema.safeParse(validBody)
      expect(result.success).toBe(true)
    })

    it('allows empty description', () => {
      const body = { photoPaths: ['/api/uploads/test.jpg'] }
      const result = bodySchema.safeParse(body)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBe('')
      }
    })

    it('rejects empty photoPaths array', () => {
      const body = { photoPaths: [] }
      const result = bodySchema.safeParse(body)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('At least one photo is required')
      }
    })

    it('rejects more than 10 photos', () => {
      const body = { photoPaths: Array(11).fill('/api/uploads/test.jpg') }
      const result = bodySchema.safeParse(body)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Maximum 10 photos allowed')
      }
    })

    it('rejects missing photoPaths', () => {
      const body = { description: 'Test' }
      const result = bodySchema.safeParse(body)
      expect(result.success).toBe(false)
    })
  })
})
