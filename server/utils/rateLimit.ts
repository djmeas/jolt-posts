const attempts = new Map<string, { count: number; blockedUntil: number | null }>()

const MAX_ATTEMPTS = 5
const BLOCK_DURATION_MS = 15 * 60 * 1000

export function resetRateLimitState(): void {
  attempts.clear()
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; blockedUntil: number | null } {
  const record = attempts.get(ip)
  const now = Date.now()

  if (!record) {
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, blockedUntil: null }
  }

  if (record.blockedUntil && now < record.blockedUntil) {
    return { allowed: false, remaining: 0, blockedUntil: record.blockedUntil }
  }

  if (record.blockedUntil && now >= record.blockedUntil) {
    attempts.delete(ip)
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, blockedUntil: null }
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - record.count - 1, blockedUntil: null }
}

export function recordFailedAttempt(ip: string): void {
  const record = attempts.get(ip)
  const now = Date.now()

  if (!record) {
    attempts.set(ip, { count: 1, blockedUntil: null })
    return
  }

  if (record.blockedUntil && now >= record.blockedUntil) {
    attempts.set(ip, { count: 1, blockedUntil: null })
    return
  }

  record.count++

  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS
  }
}

export function clearAttempts(ip: string): void {
  attempts.delete(ip)
}

export function getRateLimitInfo(ip: string): { count: number; remaining: number; blockedUntil: number | null } {
  const record = attempts.get(ip)
  const now = Date.now()

  if (!record) {
    return { count: 0, remaining: MAX_ATTEMPTS, blockedUntil: null }
  }

  if (record.blockedUntil && now < record.blockedUntil) {
    return { count: record.count, remaining: 0, blockedUntil: record.blockedUntil }
  }

  if (record.blockedUntil && now >= record.blockedUntil) {
    attempts.delete(ip)
    return { count: 0, remaining: MAX_ATTEMPTS, blockedUntil: null }
  }

  return { count: record.count, remaining: MAX_ATTEMPTS - record.count, blockedUntil: null }
}