import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { settings } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const body = await readBody(event)
  const { key, value } = body

  if (!key || typeof key !== 'string') {
    throw createError({ statusCode: 400, message: 'Key is required' })
  }

  await db
    .insert(settings)
    .values({ key, value: value || '' })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: value || '' }
    })

  return { success: true }
})