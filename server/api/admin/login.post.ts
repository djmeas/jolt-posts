import { z } from 'zod'
import { db } from '../../utils/db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'

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

  let admin = await db.query.users.findFirst({
    where: eq(users.email, 'djmeas@gmail.com')
  })

  if (!admin) {
    const passwordHash = await hashPassword(password)
    const [user] = await db
      .insert(users)
      .values({
        email: 'djmeas@gmail.com',
        passwordHash,
        isAdmin: true
      })
      .returning()
    admin = user
  } else {
    const passwordValid = await verifyPassword(admin.passwordHash, password)
    if (!passwordValid) {
      throw createError({
        statusCode: 401,
        message: 'Invalid password'
      })
    }
  }

  await setUserSession(event, {
    user: {
      id: admin.id,
      email: admin.email,
      isAdmin: admin.isAdmin
    }
  })

  return { success: true }
})