import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { users } from '../../db/schema'

const bodySchema = z.object({
  email: z.string().email('Invalid email address'),
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

  const { email, password } = parseResult.data

  const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password'
    })
  }

  const passwordValid = await verifyPassword(user.passwordHash, password)

  if (!passwordValid) {
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password'
    })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin ?? false
    }
  })

  return { success: true }
})
