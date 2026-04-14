import { z } from 'zod'

/** Body for POST /api/posts (admin create). */
export const createPostBodySchema = z.object({
  photoPaths: z
    .array(z.string())
    .min(1, 'At least one photo is required')
    .max(10, 'Maximum 10 photos allowed')
    .optional(),
  videoPath: z.string().optional(),
  description: z.string().default('')
})

export type CreatePostBody = z.infer<typeof createPostBodySchema>

export function getCreatePostRuleViolation(data: CreatePostBody): string | null {
  if (!data.photoPaths && !data.videoPath) {
    return 'Either photoPaths or videoPath is required'
  }
  if (data.photoPaths && data.videoPath) {
    return 'A post cannot have both photos and a video'
  }
  return null
}

/** Body for PUT /api/posts/:id (admin update). */
export const updatePostBodySchema = z.object({
  photoPath: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  photoPaths: z.array(z.string()).optional(),
  addPhotos: z.array(z.string()).optional(),
  removePhotoPaths: z.array(z.string()).optional(),
  videoPath: z.string().optional()
})

export type UpdatePostBody = z.infer<typeof updatePostBodySchema>
