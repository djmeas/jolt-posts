import { z } from 'zod'
import { db } from '../../utils/db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { checkRateLimit, recordFailedAttempt, clearAttempts } from '../../utils/rateLimit'

const bodySchema = z.object({
  password: z.string().min(1, 'Password is required')
})

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event) || 'unknown'
  const rateLimit = checkRateLimit(ip)

  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil((rateLimit.blockedUntil! - Date.now()) / 1000)
    throw createError({
      statusCode: 429,
      message: `Too many failed attempts. Try again in ${retryAfter} seconds.`,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Remaining': '0'
      }
    })
  }

  setResponseHeaders(event, {
    'X-RateLimit-Remaining': String(rateLimit.remaining)
  })

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
      recordFailedAttempt(ip)
      const newRemaining = checkRateLimit(ip).remaining
      setResponseHeaders(event, { 'X-RateLimit-Remaining': String(newRemaining) })
      throw createError({
        statusCode: 401,
        message: 'Invalid password'
      })
    }
  }

  clearAttempts(ip)

  await setUserSession(event, {
    user: {
      id: admin.id,
      email: admin.email,
      isAdmin: admin.isAdmin
    }
  })

  return { success: true }
})