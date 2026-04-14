import { describe, it, expect } from 'vitest'
import { normalizePublicUploadPath } from './uploadPath'

describe('normalizePublicUploadPath', () => {
  it('rewrites API upload prefix to public uploads path', () => {
    expect(normalizePublicUploadPath('/api/uploads/clip.mp4')).toBe('/uploads/clip.mp4')
  })

  it('leaves already-public paths unchanged', () => {
    expect(normalizePublicUploadPath('/uploads/photo.jpg')).toBe('/uploads/photo.jpg')
  })
})
