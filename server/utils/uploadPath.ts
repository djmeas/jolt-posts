/** Normalize stored paths to public `/uploads/...` URLs for JSON responses. */
export function normalizePublicUploadPath(path: string): string {
  return path.replace(/^\/api\/uploads\//, '/uploads/')
}
