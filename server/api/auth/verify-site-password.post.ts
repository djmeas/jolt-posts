import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { settings } from '../../db/schema'

const bodySchema = z.object({
  password: z.string().min(1, 'Password is required')
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parseResult = bodySchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.issues.map((e) => e.message).join(', ')
    })
  }

  const { password } = parseResult.data

  const sitePassword = await db.query.settings.findFirst({
    where: eq(settings.key, 'sitePassword')
  })

  if (!sitePassword || !sitePassword.value) {
    return { success: true }
  }

  if (password !== sitePassword.value) {
    throw createError({
      statusCode: 401,
      message: 'Incorrect password'
    })
  }

  return { success: true }
})