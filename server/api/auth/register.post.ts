import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { users } from '../../db/schema'

const bodySchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
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

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email)
  })

  if (existing) {
    throw createError({
      statusCode: 400,
      message: 'Email already registered'
    })
  }

  const passwordHash = await hashPassword(password)

  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      isAdmin: false
    })
    .returning({ id: users.id, email: users.email, isAdmin: users.isAdmin })

  if (!user) {
    throw createError({
      statusCode: 500,
      message: 'Failed to create user'
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
