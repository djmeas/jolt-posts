import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit, recordFailedAttempt, clearAttempts, getRateLimitInfo, resetRateLimitState } from './rateLimit'

describe('rateLimit utility', () => {
  beforeEach(() => {
    resetRateLimitState()
  })

  describe('checkRateLimit', () => {
    it('allows first request with MAX_ATTEMPTS - 1 remaining', () => {
      const result = checkRateLimit('192.168.1.1')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
      expect(result.blockedUntil).toBe(null)
    })

    it('blocks after MAX_ATTEMPTS failed attempts', () => {
      const ip = '192.168.1.2'
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(ip)
      }
      const result = checkRateLimit(ip)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.blockedUntil).toBeGreaterThan(Date.now())
    })

    it('allows request after block expires', () => {
      const ip = '192.168.1.3'
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(ip)
      }
      const blocked = checkRateLimit(ip)
      expect(blocked.allowed).toBe(false)

      const originalNow = Date.now
      Date.now = () => blocked.blockedUntil! + 1000

      const result = checkRateLimit(ip)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)

      Date.now = originalNow
    })
  })

  describe('recordFailedAttempt', () => {
    it('increments failed attempt count', () => {
      const ip = '192.168.1.4'
      expect(checkRateLimit(ip).remaining).toBe(4)

      recordFailedAttempt(ip)
      expect(checkRateLimit(ip).remaining).toBe(3)

      recordFailedAttempt(ip)
      expect(checkRateLimit(ip).remaining).toBe(2)
    })

    it('blocks after 5 failed attempts', () => {
      const ip = '192.168.1.5'
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(ip)
      }
      expect(checkRateLimit(ip).allowed).toBe(false)
    })
  })

  describe('clearAttempts', () => {
    it('resets rate limit state for IP', () => {
      const ip = '192.168.1.6'
      for (let i = 0; i < 3; i++) {
        recordFailedAttempt(ip)
      }
      expect(checkRateLimit(ip).remaining).toBe(1)

      clearAttempts(ip)
      expect(checkRateLimit(ip).remaining).toBe(4)
    })

    it('only clears specified IP, not others', () => {
      const ip1 = '192.168.1.7'
      const ip2 = '192.168.1.8'
      for (let i = 0; i < 3; i++) {
        recordFailedAttempt(ip1)
        recordFailedAttempt(ip2)
      }

      clearAttempts(ip1)
      expect(checkRateLimit(ip1).remaining).toBe(4)
      expect(checkRateLimit(ip2).remaining).toBe(1)
    })
  })

  describe('getRateLimitInfo', () => {
    it('returns correct info for new IP', () => {
      const result = getRateLimitInfo('192.168.1.9')
      expect(result.count).toBe(0)
      expect(result.remaining).toBe(5)
      expect(result.blockedUntil).toBe(null)
    })

    it('returns correct info after failed attempts', () => {
      const ip = '192.168.1.10'
      recordFailedAttempt(ip)
      recordFailedAttempt(ip)
      const result = getRateLimitInfo(ip)
      expect(result.count).toBe(2)
      expect(result.remaining).toBe(3)
    })

    it('returns correct info when blocked', () => {
      const ip = '192.168.1.11'
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(ip)
      }
      const result = getRateLimitInfo(ip)
      expect(result.count).toBe(5)
      expect(result.remaining).toBe(0)
      expect(result.blockedUntil).not.toBe(null)
    })
  })
})